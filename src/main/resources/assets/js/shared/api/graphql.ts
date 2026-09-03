import { err, errAsync, ok, type Result, ResultAsync } from 'neverthrow';

import { requestJson } from './client';
import { AppError } from './errors';

export type GraphQlVariables = Record<string, unknown>;

/**
 * Where this module's data plane lives. Only the shell knows it — the url carries the admin tool's
 * base path — so the bootstrap sets it from `host.baseUrl` before anything can ask.
 *
 * ? Module-level, so with several sections mounted the first mount's prefix answers for all. Sound
 * ? here because every section prefix of this app serves the same schema behind the same audience —
 * ? a provider whose sections have different data planes must scope this per mount instead.
 */
let endpoint: string | undefined;

export function setGraphQlEndpoint(url: string): void {
  endpoint = url;
}

/**
 * One root field and what to select under it — the whole of an ordinary read.
 *
 * The caller hands over the parts rather than a finished document, so the transport can name the
 * operation, put several roots in one document, and tell which field an answer belongs to without ever
 * parsing query text.
 */
export type GraphQlRoot = {
  /** The root field to ask for. Its answer arrives under this same name. */
  field: string;
  /**
   * Its arguments, **referencing variables by name** — `(start: $start, count: $count)`.
   *
   * ! Never a value spliced in. Values travel as JSON variables, so nothing a user typed is ever part of
   * ! the document text; declare them in `options.variables` and the transport writes both the header and
   * ! the payload from the same place.
   */
  args?: string;
  /** Its selection, braces included — `{ key displayName }`. Omitted for a scalar field. */
  selection?: string;
  /**
   * The variables its `args` use, as name → GraphQL type: `{ start: 'Int', sort: 'UserSort' }`.
   *
   * ! Declared by the root rather than by the caller, and that is what keeps the document valid. GraphQL
   * ! rejects a document using a variable it never declared *and* one declaring a variable it never uses,
   * ! so the two lists must agree — putting the declaration next to the `args` that reference it means
   * ! there is only one list. A caller supplies values, not types, and cannot forget a declaration.
   */
  variables?: Record<string, string>;
};

export type GraphQlOptions = {
  /** Values for the variables the roots declare, by name. */
  values?: GraphQlVariables;
  signal?: AbortSignal;
};

/**
 * Several root fields answered together, each of which may have failed on its own.
 *
 * `data` carries every field asked for, with `null` where that field failed; `message` is what the
 * response said about the failures, if anything. Deciding which of them matters is the caller's — it
 * knows what it asked for, so the check is `data.projects == null` at the one place that cares rather
 * than a rule the transport has to guess at.
 */
export type GraphQlRootsAnswer<T> = {
  data: T;
  message?: string;
};

const NO_ENDPOINT = 'The section asked for data before it was mounted';

type GraphQlError = { message?: unknown };

type GraphQlBody<T> = {
  data?: T;
  errors?: GraphQlError[];
};

function readErrorMessage(error: GraphQlError | undefined): string {
  const { message } = error ?? {};
  return typeof message === 'string' && message.length > 0 ? message : 'GraphQL request failed';
}

/**
 * Every message the response carried, not just the first.
 *
 * ! Which error belongs to which field is unknowable: lib-graphql drops the `path` graphql-java
 * ! attaches (`ExecutionResultMapper.serializeError`). A document asking for several roots can therefore
 * ! only report all of its messages, and a caller reading one failed field out of it gets the lot.
 */
function readErrorMessages(errors: readonly GraphQlError[]): string | undefined {
  return errors.length === 0
    ? undefined
    : errors.map((error) => readErrorMessage(error)).join('; ');
}

function toAppError(error: unknown): AppError {
  return error instanceof AppError ? error : new AppError(String(error), error);
}

/**
 * The verdict for a document asking one thing: any error fails it, because a response can carry data
 * *and* errors, and reporting a partial result as success would hide a failed field behind a
 * half-rendered screen.
 */
function toData<T>(body: GraphQlBody<T>): Result<T, AppError> {
  const [firstError] = body.errors ?? [];
  if (firstError != null) {
    return err(new AppError(readErrorMessage(firstError)));
  }

  if (body.data == null) {
    return err(new AppError('GraphQL response carried neither data nor errors'));
  }

  return ok(body.data);
}

/**
 * The verdict for a single root request: it succeeded if its own field arrived.
 *
 * ! Presence is the test, not the absence of errors, because every root field on the schema is nullable
 * ! — `schema/query.ts` explains why at length. A field that resolved is an answer even when a sibling
 * ! in the same document failed.
 *
 * ! The corollary is a constraint on `requestGraphQl`: it is for a root field that always resolves when
 * ! it succeeds. A field whose `null` is a legitimate answer belongs on `requestGraphQlDocument`.
 */
function rootData<T>(body: GraphQlBody<T>, field: string): Result<T, AppError> {
  const data = body.data as Record<string, unknown> | undefined;
  if (data?.[field] == null) {
    return err(
      new AppError(
        readErrorMessages(body.errors ?? []) ??
          `GraphQL response carried no \`${field}\` and no error explaining why`,
      ),
    );
  }

  return ok(body.data as T);
}

type Call = {
  document: string;
  variables?: GraphQlVariables;
  signal?: AbortSignal;
  settle: (result: Result<unknown, AppError>) => void;
  /** Turns a body into this caller's verdict. Its own, because callers ask for different things. */
  read: (body: GraphQlBody<unknown>) => Result<unknown, AppError>;
};

// ! XP gives an application one single-threaded GraalJS context, so overlapping requests into this
// ! app's JS serialize at best and throw at worst — see _GraalJS_ in `docs/platform-facts.md`. One
// ! request in flight at a time is therefore mandatory, and it is also why a screen asks for everything
// ! it needs in one document: several root fields cost one round trip, several requests cost several.
let queued: Call[] = [];
let draining = false;

function schedule(): void {
  if (draining) {
    return;
  }

  draining = true;
  void Promise.resolve().then(drain);
}

async function drain(): Promise<void> {
  // ! `finally`, and the `catch` in `sendOrFail`, are load-bearing rather than defensive: a throw
  // ! escaping here would leave `draining` true with calls still queued, and since `schedule` returns
  // ! early while it is true, every later request in the page's life would wait on a loop that already
  // ! died — no error, no notification, every section stuck on its skeleton until a reload.
  try {
    for (let call = takeNext(); call !== undefined; call = takeNext()) {
      await sendOrFail(call);
    }
  } finally {
    draining = false;
  }
}

/**
 * `read` works on a payload that only crossed the wire as an `as` cast, so a body no GraphQL server
 * should produce throws rather than answering. The caller has to hear about it, or its promise never
 * settles at all.
 */
async function sendOrFail(call: Call): Promise<void> {
  try {
    await send(call);
  } catch (error) {
    // Settling twice is a no-op, so a call `send` already answered keeps its real result.
    call.settle(err(toAppError(error)));
  }
}

function takeNext(): Call | undefined {
  dropAborted();

  const [next] = queued;
  queued = queued.slice(1);
  return next;
}

/**
 * Answers the calls whose caller has already given up, without sending them.
 *
 * Every store aborts its previous load before starting the next, so holding Refresh down leaves several
 * generations queued; only the newest is still wanted, and the rest would each cost a round trip on the
 * app's single JS thread for an answer that is dropped on arrival.
 */
function dropAborted(): void {
  const aborted = queued.filter(({ signal }) => signal?.aborted === true);
  if (aborted.length === 0) {
    return;
  }

  queued = queued.filter(({ signal }) => signal?.aborted !== true);
  for (const call of aborted) {
    call.settle(err(new AppError('Request was cancelled')));
  }
}

async function send(call: Call): Promise<void> {
  if (endpoint == null) {
    call.settle(err(new AppError(NO_ENDPOINT)));
    return;
  }

  const answered = await requestJson<GraphQlBody<unknown>>(endpoint, {
    method: 'POST',
    body: { query: call.document, variables: call.variables },
    signal: call.signal,
  });

  call.settle(answered.andThen(call.read));
}

function enqueue<T>(call: Omit<Call, 'settle'>): ResultAsync<T, AppError> {
  if (endpoint == null) {
    return errAsync(new AppError(NO_ENDPOINT));
  }

  const settled = new Promise<Result<T, AppError>>((resolve) => {
    queued.push({ ...call, settle: (result) => resolve(result as Result<T, AppError>) });
  });

  schedule();

  return new ResultAsync(settled);
}

function selectionLine({ field, args, selection }: GraphQlRoot): string {
  // No space before the arguments, so the document reads the way it would be written by hand.
  return [`${field}${args ?? ''}`, selection].filter((part) => part !== undefined).join(' ');
}

/**
 * ! The header is derived from the roots, so it declares exactly the variables they use — a caller cannot
 * ! forget a declaration or leave a stale one behind, both of which GraphQL rejects. Two roots naming the
 * ! same variable are fine while they agree on its type; disagreeing is a mistake in our own code, and it
 * ! is reported as a value like every other failure rather than thrown into a component effect.
 */
function documentFor(roots: readonly GraphQlRoot[], name: string): Result<string, AppError> {
  const declared = new Map<string, string>();
  for (const root of roots) {
    const { args, variables } = root;

    for (const [key, type] of Object.entries(variables ?? {})) {
      const seen = declared.get(key);
      if (seen !== undefined && seen !== type) {
        return err(new AppError(`Roots disagree on the type of $${key}: ${seen} and ${type}`));
      }
      declared.set(key, type);
    }

    // ! Co-locating the declaration with the arguments makes them easy to keep in step; only comparing
    // ! them makes it impossible to get wrong. Both halves of the mismatch are GraphQL validation errors,
    // ! and both would surface as a failed screen rather than as the typo they are.
    const used = new Set([...(args ?? '').matchAll(/\$(\w+)/g)].map(([, key]) => key));
    const names = new Set(Object.keys(variables ?? {}));

    for (const key of used) {
      if (!names.has(key)) {
        return err(new AppError(`\`${root.field}\` uses $${key} without declaring it`));
      }
    }
    for (const key of names) {
      if (!used.has(key)) {
        return err(new AppError(`\`${root.field}\` declares $${key} without using it`));
      }
    }
  }

  const header =
    declared.size === 0
      ? ''
      : `(${[...declared].map(([key, type]) => `$${key}: ${type}`).join(', ')})`;

  return ok(`query ${name}${header} { ${roots.map(selectionLine).join(' ')} }`);
}

function operationName(field: string): string {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Reads one root field off this section's own endpoint.
 *
 * Fails when its field did not arrive. For a screen that needs several domains, reach for
 * `requestGraphQlRoots` rather than calling this once per domain: one request is in flight at a time,
 * so several calls are several round trips.
 */
export function requestGraphQl<T>(
  root: GraphQlRoot,
  options: GraphQlOptions = {},
): ResultAsync<T, AppError> {
  const document = documentFor([root], operationName(root.field));
  if (document.isErr()) {
    return errAsync(document.error);
  }

  return enqueue<T>({
    document: document.value,
    variables: options.values,
    signal: options.signal,
    read: (body) => rootData(body, root.field),
  });
}

/**
 * Reads several root fields in one document, and hands back whatever arrived.
 *
 * This is how a screen spanning domains stays one round trip. It does not decide what a failure means:
 * a field that failed is `null` in `data`, alongside `message`, and the caller — which knows which
 * fields it asked for and what each one feeds — turns that into per-domain state. It fails as a whole
 * only when there is no `data` at all.
 */
export function requestGraphQlRoots<T>(
  roots: readonly GraphQlRoot[],
  name: string,
  options: GraphQlOptions = {},
): ResultAsync<GraphQlRootsAnswer<T>, AppError> {
  const document = documentFor(roots, name);
  if (document.isErr()) {
    return errAsync(document.error);
  }

  return enqueue<GraphQlRootsAnswer<T>>({
    document: document.value,
    variables: options.values,
    signal: options.signal,
    read: (body) =>
      body.data == null
        ? err(
            new AppError(
              readErrorMessages(body.errors ?? []) ?? 'GraphQL response carried no data',
            ),
          )
        : ok({ data: body.data as T, message: readErrorMessages(body.errors ?? []) }),
  });
}

/**
 * The escape hatch: a whole document, sent as written.
 *
 * For what `GraphQlRoot` cannot express — arguments, variables, aliases, a mutation. Any error fails the
 * call, and a `null` field is handed through untouched, which is what makes it the right home for a field
 * whose `null` is a legitimate answer.
 *
 * `operationName` is deliberately not sent: lib-graphql's ExecutionInput ignores it, so a document
 * holding several named operations would silently run the wrong one. One operation per call.
 */
export function requestGraphQlDocument<T>(
  query: string,
  variables?: GraphQlVariables,
  signal?: AbortSignal,
): ResultAsync<T, AppError> {
  return enqueue<T>({ document: query, variables, signal, read: (body) => toData<unknown>(body) });
}
