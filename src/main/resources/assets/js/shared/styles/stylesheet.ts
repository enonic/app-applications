import { atom } from 'nanostores';

// Declared here because this module owns the styling: the build emits it as `_static/main.css`,
// beside the module that fetches it back.
import '../../../css/index.css';

// ? @vite-ignore: the stylesheet sits beside the module at runtime, so the url is resolved then.
const STYLESHEET_URL = new URL(/* @vite-ignore */ './main.css', import.meta.url).href;

// ! Set only once fetched: `AppRoot` reads the rules at adoption for its `@property` fallback, and an
// ! empty sheet would leave every `--tw-*` composition (rings, shadows, gradients) broken.
export const $stylesheets = atom<CSSStyleSheet[]>([]);

loadStyleSheet();

//
// * Internal
//

// Fetched once per module, not per mount, so `mount` stays synchronous and never waits on it.
function loadStyleSheet(): void {
  const created = new CSSStyleSheet();

  void fetch(STYLESHEET_URL)
    .then((response) => response.text())
    .then((css) => created.replace(css))
    .then(() => $stylesheets.set([created]))
    .catch((cause: unknown) => {
      console.error('The Applications section could not load its stylesheet:', cause);
    });
}
