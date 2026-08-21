// Declared here because this module owns the styling: the build emits it as `_static/main.css`,
// beside the module that fetches it back.
import '../../../css/index.css';

// ? @vite-ignore: the stylesheet sits beside the module at runtime, so the url is resolved then.
const STYLESHEET_URL = new URL(/* @vite-ignore */ './main.css', import.meta.url).href;

const sheet = loadStyleSheet();

/**
 * Adopts the section's styles into the root the host handed over, once per root.
 *
 * ! The contract guarantees a shadow root. The guard is what keeps a container that somehow sat in
 * ! the light DOM from pushing this app's preflight onto the whole admin page.
 */
export function adoptStyleSheet(container: Node): void {
  const root = container.getRootNode();

  if (root instanceof ShadowRoot && !root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
}

//
// * Internal
//

/**
 * Constructed and fetched once per module, so every mount adopts the same parsed sheet — and handed
 * back while still empty, so `mount` stays synchronous and never waits for the fetch. The rules
 * appear as soon as it lands.
 */
function loadStyleSheet(): CSSStyleSheet {
  const created = new CSSStyleSheet();

  void fetch(STYLESHEET_URL)
    .then((response) => response.text())
    .then((css) => created.replace(css))
    .catch((cause: unknown) => {
      console.error('The Applications section could not load its stylesheet:', cause);
    });

  return created;
}
