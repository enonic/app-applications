/**
 * An application's icon, base64-encoded so it can travel inside a JSON response.
 *
 * `lib/xp/app`'s `getDescriptor` carries the icon as a `ByteSource`, and returning that straight from
 * a controller is what XP's own documentation shows. It cannot work on GraalJS, which this app pins:
 * `PortalResponseSerializer.populateBody` asks `ScriptValue.isObject()` first, and every Java object
 * read out of a JS object is wrapped in `GraalObjectScriptValue`, whose `isObject()` is always true —
 * so the body becomes a map of the `ByteSource`'s method names rather than its bytes. Serving the
 * bytes over their own endpoint fails for a second reason too: XP builds one single-threaded GraalJS
 * context per application, so the parallel image requests a list of rows makes collide.
 *
 * Hence base64 on the Java side, inside the same payload as the rest of the row.
 */

export type EncodeApplicationIconParams = {
  application: string;
};

type EncodeApplicationIconHandler = {
  setApplication(value: string): void;
  execute(): string | null;
};

/** Null when the application ships no icon — nothing to encode, not an empty string. */
export function encodeApplicationIcon(params: EncodeApplicationIconParams): string | null {
  const bean = __.newBean<EncodeApplicationIconHandler>(
    'com.enonic.xp.app.applications.lib.icon.EncodeApplicationIconHandler',
  );
  bean.setApplication(params.application);
  return bean.execute();
}
