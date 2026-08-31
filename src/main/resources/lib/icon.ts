/**
 * An application's icon, base64-encoded so it travels inside a JSON response. ! Returning the `ByteSource`
 * `getDescriptor` carries cannot work on GraalJS: the serializer sees every Java object as an object, so
 * the body becomes a map of method names. A bytes endpoint fails too — one JS thread, parallel row images.
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
