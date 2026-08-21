// Inline styles on purpose: this app ships no stylesheet yet, so nothing here may
// depend on the host's utilities being in scope.
export function HelloWorld() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Hello world</h2>
    </div>
  );
}
