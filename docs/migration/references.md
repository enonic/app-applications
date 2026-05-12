# Verbatim references from app-contentstudio

This file is a read-only snapshot of code templates to copy/adapt during implementation. Source: `enonic/app-contentstudio` master at the time of plan creation. Refresh when bumping CS dependencies.

## 1. `vite.config.css.mjs`

From CS `modules/lib/vite.config.css.mjs`:

```js
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  const isProduction = mode === 'production';

  return {
    base: './',
    plugins: [tailwindcss()],
    build: {
      outDir: path.resolve(__dirname, 'build/resources/main/assets'),
      emptyOutDir: false,
      cssMinify: isProduction,
      rollupOptions: {
        input: {
          'styles/tailwind': path.resolve(__dirname, 'src/main/resources/assets/styles/tailwind.css'),
        },
        output: {
          assetFileNames: '[name][extname]',
        },
      },
    },
  };
});
```

Adapt: input key `styles/tailwind` so output is `build/resources/main/assets/styles/tailwind.css`.

## 2. `tailwind.css`

From CS `modules/lib/src/main/resources/assets/styles/tailwind.css`:

```css
@layer theme, base, legacy, utilities, overrides;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@enonic/ui/preset.css";
@import "tw-animate-css";
@import "tailwindcss/utilities.css" layer(utilities);

@source "../../../../../node_modules/@enonic/ui/";
@source "../../../../../node_modules/@enonic/lib-admin-ui/ui2/";
@source "../../../../../node_modules/@enonic/lib-admin-ui/form2/";
@source "../../../../../src/main/resources/assets/js/v2/";

@theme {
  /* Add app-specific theme overrides here when needed. */
}

@layer overrides {
  /* Hide launcher buttons injected by the Launcher app */
  #launcher-button { display: none !important; }
  /* Make Preact roots ignore legacy outline styles */
  .contents * { outline-style: none; }
}
```

Note the extra `@source` glob for our own `v2/` source tree — Tailwind needs to scan it to emit the right utility classes.

## 3. `LegacyElement.tsx`

From CS `modules/lib/src/main/resources/assets/js/v6/features/shared/LegacyElement.tsx` (adapt path to `v2/`):

```tsx
import {LegacyElement as BaseLegacyElement} from '@enonic/lib-admin-ui/ui2/LegacyElement';
import {IdProvider} from '@enonic/ui';
import type {ComponentProps, ComponentType} from 'react';
import {render} from 'react-dom';

export class LegacyElement<
  C extends ComponentType<any>,
  P extends ComponentProps<C> = ComponentProps<C>,
> extends BaseLegacyElement<C, P> {
  protected renderJsx(): void {
    const Component = this.component;
    render(
      <IdProvider prefix={this.getPrefix()}>
        <Component {...this.props.get()} />
      </IdProvider>,
      this.getHTMLElement(),
    );
  }
}
```

## 4. `App.tsx` shape

From CS `modules/lib/src/main/resources/assets/js/v6/features/App.tsx`, adapted:

```tsx
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import type {ReactElement} from 'react';
import {LegacyElement} from './shared/LegacyElement';
import './features/events/applicationEvents'; // side-effect: subscribe WS

const App = (): ReactElement => {
  return null; // populated incrementally — BrowsePage, DetailPanel, Dialogs
};
App.displayName = 'App';

export class AppElement extends LegacyElement<typeof App> {
  private static INSTANCE: AppElement;

  private constructor() {
    super({}, App);
  }

  static initialize(): void {
    if (!AppElement.INSTANCE) {
      AppElement.INSTANCE = new AppElement();
      Body.get().appendChild(AppElement.INSTANCE);
    }
  }
}
```

## 5. `utils/storage/sync.ts`

Copy verbatim from CS `modules/lib/src/main/resources/assets/js/v6/features/utils/storage/sync.ts`. Helpers it depends on (`createThrottle` from `../timing/createThrottle`, `normalize` from `../format/keys`) must also be copied. See CS source for verbatim content (large; not reproduced here to keep this doc readable).

Key exports:
- `syncAtomStore<V>(store, name, options?)` — for `atom`
- `syncMapStore<M>(store, name, options?)` — for `map`, supports partial-key sync via `options.keys`

Storage prefix: `enonic:cs:` in CS. **Change to `enonic:apps:`** for `app-applications` to avoid key collision when both tools run in the same admin session.

## 6. `app.store.ts` pattern

From CS:

```ts
import {computed, map} from 'nanostores';
import {syncMapStore} from '../utils/storage/sync';

export type Theme = 'light' | 'dark' | 'system';
type AppStore = { theme: Theme; page: 'browse'; /* …more keys */ };

export const $app = map<AppStore>({
  theme: getInitialTheme(),
  page: 'browse',
});

syncMapStore($app, 'app', { keys: ['theme'], loadInitial: true, syncTabs: true });

export const $isBrowse = computed($app, ({page}) => page === 'browse');

export function setTheme(theme: Theme): void { $app.setKey('theme', theme); }

$app.subscribe(state => applyTheme(state.theme));
function applyTheme(theme: Theme) { /* document.documentElement.classList.toggle('dark', ...) */ }
function getInitialTheme(): Theme { /* read localStorage, fall back to 'system' */ return 'system'; }
```

## 7. `vitest.config.ts`

From `lib-admin-ui`:

```ts
/// <reference types="vitest/config" />
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/main/resources/assets/js/v2/**/*.test.{ts,tsx}'],
    environment: 'node',
    passWithNoTests: true,
    reporters: ['dot'],
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
    },
  },
});
```

## 8. `utils/url/api.ts`

Adapted from CS `utils/url/cms.ts`:

```ts
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

const ADMIN_PATH = '/admin';
const REST_PATH = 'rest-v2/apps';

function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/').replace(/([^:])\/+/g, '$1/');
}

/** Build URL under /admin/rest-v2/apps/... */
export function getApiUrl(path: string): string {
  return joinPath(ADMIN_PATH, REST_PATH, path);
}

export type ServerAppAction = 'install' | 'installUrl' | 'uninstall' | 'start' | 'stop';

/** Absolute portal URL from injected CONFIG. */
export function getServerAppUrl(action: ServerAppAction): string {
  return CONFIG.getString(`serverAppApi.${action}`);
}

export function getMarketUrl(): string {
  return CONFIG.getString('marketApi');
}
```

## 9. `*.stories.tsx` template

From `lib-admin-ui` `form2/components/checkbox-input/CheckboxInput.stories.tsx`:

```tsx
import type {Meta, StoryObj} from '@storybook/preact-vite';
import {useState} from 'react';
import {Button} from './Button';
import type {ButtonProps} from './Button';

const meta: Meta<ButtonProps> = {
  title: 'ui2/Button',
  component: Button,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  name: 'Examples / Default',
  args: {label: 'Click me'},
};

export const Disabled: Story = { args: {label: 'Disabled', disabled: true} };

export const AllStates: Story = {
  render: () => {
    const [n, setN] = useState(0);
    return <Button label={`Clicked ${n}`} onClick={() => setN(n + 1)} />;
  },
};
```

## Refresh policy

This file is a snapshot. When CS bumps its dependencies meaningfully (especially `@enonic/ui` or `tailwindcss`), refresh the relevant section here and update the corresponding phase doc.
