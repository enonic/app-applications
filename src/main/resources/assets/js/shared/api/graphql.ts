import { err, errAsync, ok, type Result, ResultAsync } from 'neverthrow';

import { requestJson } from './client';
import { AppError } from './errors';

export type GraphQlVariables = Record<string, unknown>;

/** Only the shell knows this url — it carries the tool's base path — so `mount` sets it from `host.baseUrl`. */
let endpoint: string | undefined;

export function setGraphQlEndpoint(url: string): void {
  endpoint = url;
}

/**
 * One root field and what to select under it. The caller hands over the parts rather than a document, so
 * the transport can name the operation, batch several roots, and tell whose answer is whose.
 */
export type GraphQlRoot = {
  /** The root field to ask for. Its answer arrives under this same name. */
  field: string;
  /**
   * Its arguments, **referencing variables by name** — `(start: $start)`. ! Never a spliced value: values
   * travel as JSON variables, so nothing a user typed becomes document text.
   */
  args?: string;
  /** Its selection, braces included — `{ key displayName }`. Omitted for a scalar field. */
  selection?: string;
  /**
   * The variables its `args` use, as name → GraphQL type. ! Declared by the root, not the caller: GraphQL
   * rejects both an undeclared and an unused variable, so one list beside the `args` cannot drift.
   */
  variables?: Record<string, string>;
};

export type GraphQlOptions = {
  /** Values for the variables the roots declare, by name. */
  values?: GraphQlVariables;
  signal?: AbortSignal;
};

/**
 * Several roots answered together: `data` carries every field asked for with `null` where one failed,
 * `message` what the response said. Which failure matters is the caller's call, not the transport's.
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
 * Every message, not just the first. ! Which error belongs to which field is unknowable — lib-graphql
 * drops the `path` graphql-java attaches — so a multi-root document can only report the lot.
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
 * Any error fails a document asking one thing: a response can carry data *and* errors, and a partial
 * result reported as success would hide a failed field behind a half-rendered screen.
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
 * A single root succeeded if its own field arrived — presence, not the absence of errors, since every
 * root on the schema is nullable. ! So `requestGraphQl` is only for a field that always resolves when it
 * succeeds; one whose `null` is a real answer belongs on `requestGraphQlDocument`.
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

// ! XP gives an application one single-threaded GraalJS context, so overlapping requests into our own JS
// ! serialize at best and throw at worst. One in flight at a time is mandatory — and it is why a screen
// ! asks for every domain it needs in one document.
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
  // ! Load-bearing, not defensive: a throw escaping here leaves `draining` true with calls queued, and
  // ! `schedule` returns early while it is — so every later request waits on a dead loop, with no error
  // ! and no notification.
  try {
    for (let call = takeNext(); call !== undefined; call = takeNext()) {
      await sendOrFail(call);
    }
  } finally {
    draining = false;
  }
}

/**
 * `read` works on a payload that only crossed the wire as a cast, so a body no server should produce
 * throws rather than answering — and the caller's promise would never settle.
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
 * Answers the calls whose caller already gave up, without sending them. Every store aborts its previous
 * load, so holding Refresh down queues several generations — only the newest is wanted, and each of the
 * rest would cost a round trip on the app's one JS thread.
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
 * ! The header is derived from the roots, so it declares exactly the variables they use — a caller can
 * ! neither forget a declaration nor leave a stale one, both of which GraphQL rejects. Two roots may share
 * ! a variable while they agree on its type; disagreeing is our own bug, reported as a value.
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

    // ! Comparing the two lists is what makes the mismatch impossible to get wrong: both halves are
    // ! GraphQL validation errors, and both would surface as a failed screen rather than as the typo.
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
 * Reads one root field off this section's endpoint, failing when that field did not arrive. A screen
 * spanning domains uses `requestGraphQlRoots`: one request is in flight at a time, so several calls are
 * several round trips.
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
 * Reads several roots in one document, which is how a screen spanning domains stays one round trip. A
 * failed field is `null` in `data` beside `message`, and the caller turns that into per-domain state.
 * Fails as a whole only when there is no `data` at all.
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
 * A whole document as written, for what `GraphQlRoot` cannot express — arguments, aliases, a mutation.
 * Any error fails it and a `null` field passes through. ! `operationName` is not sent: lib-graphql ignores
 * it, so a document holding several named operations would silently run the wrong one.
 */
export function requestGraphQlDocument<T>(
  query: string,
  variables?: GraphQlVariables,
  signal?: AbortSignal,
): ResultAsync<T, AppError> {
  return enqueue<T>({ document: query, variables, signal, read: (body) => toData<unknown>(body) });
}
