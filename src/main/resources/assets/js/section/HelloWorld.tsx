export type HelloWorldProps = {
  baseUrl: string;
  locale: string;
};

// Inline styles on purpose: this app ships no stylesheet yet, so nothing here may
// depend on the host's utilities being in scope.
export function HelloWorld({ baseUrl, locale }: HelloWorldProps) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Hello world</h2>

      {/* Two members of the host object, on screen: proof it arrived, not just that mount ran. */}
      <dl style={{ marginTop: '1rem', display: 'grid', gap: '0.25rem' }}>
        <dt style={{ fontWeight: 600 }}>baseUrl</dt>
        <dd>{baseUrl}</dd>
        <dt style={{ fontWeight: 600 }}>locale</dt>
        <dd>{locale}</dd>
      </dl>
    </div>
  );
}
