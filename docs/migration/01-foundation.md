# Phase 1 — Foundation

**Status:** Not started
**Depends on:** —
**Blocks:** 2, 3, 4

## Goal

Add Preact, `@enonic/ui`, Tailwind v4, and nanostores to `app-applications` without changing any visible UI. After this phase, `pnpm build` produces a `tailwind.css` next to the existing `main.css`, the admin tool HTML loads both, and the runtime has Preact + `@enonic/ui` available — but no Preact component is mounted yet.

## Tasks

### Dependencies

- [ ] Bump `gradle.properties.libAdminUiVersion` to match `app-contentstudio` master.
- [ ] Add to `package.json` `dependencies`:
  - [ ] `@enonic/ui: ~1.0.0-beta.1`
  - [ ] `preact: ^10.29`
  - [ ] `nanostores: ^0.11.4`
  - [ ] `@nanostores/preact: ^1.0.0`
  - [ ] `@radix-ui/react-slot: ^1.2`
  - [ ] `focus-trap-react: ^11.0`
  - [ ] `lucide-react: ^0.577`
  - [ ] `class-variance-authority: ^0.7`
  - [ ] `clsx: ^2.1`
  - [ ] `tailwind-merge: ^3.0`
- [ ] Add to `package.json` `devDependencies`:
  - [ ] `tailwindcss: ^4.3`
  - [ ] `@tailwindcss/vite: ^4.3`
  - [ ] `tw-animate-css: ^1.3`
- [ ] `pnpm install` clean (no resolution warnings beyond peer ranges).

### Vite config

- [ ] Edit `vite.config.ts` (JS pipeline):
  - [ ] Add `resolve.alias`:
    - `react → preact/compat`
    - `react-dom → preact/compat`
    - `react/jsx-runtime → preact/jsx-runtime`
    - `react/jsx-dev-runtime → preact/jsx-dev-runtime`
  - [ ] Add `resolve.dedupe: ['preact', 'preact/compat']`
  - [ ] Add `optimizeDeps.include: ['preact', 'preact/hooks', 'preact/compat', '@enonic/ui']`
  - [ ] Set `esbuild.jsx: 'automatic'`, `esbuild.jsxImportSource: 'preact'`
- [ ] Create `vite.config.css.mjs` — see [references.md §1](./references.md#1-viteconfigcssmjs).
  - [ ] `@tailwindcss/vite` plugin
  - [ ] Input: `src/main/resources/assets/styles/tailwind.css`
  - [ ] Output to `build/resources/main/assets/styles/` with `emptyOutDir: false`

### TypeScript

- [ ] Edit `tsconfig.json`:
  - [ ] Add `"jsx": "react-jsx"`
  - [ ] Add `"jsxImportSource": "preact"`
  - [ ] Add `paths`: `{"react": ["node_modules/preact/compat"], "react-dom": ["node_modules/preact/compat"]}`
  - [ ] Add `**/*.tsx` to `include`
- [ ] `pnpm exec tsc --noEmit` clean.

### Tailwind entry

- [ ] Create `src/main/resources/assets/styles/tailwind.css` — see [references.md §2](./references.md#2-tailwindcss).

### Gradle / pnpm scripts

- [ ] Add npm scripts to `package.json`:
  - [ ] `build:js`: `vite build`
  - [ ] `build:css`: existing Less build (keep)
  - [ ] `build:tailwind`: `vite build --config vite.config.css.mjs`
  - [ ] `build`: `pnpm --color /^build:.*$/` (parallel)
- [ ] Update `gradle/node.gradle` so `pnpmBuild` invokes the parallel `build` script.
- [ ] Verify `./gradlew :pnpmBuild` produces:
  - `build/resources/main/assets/js/bundle.js`
  - `build/resources/main/assets/styles/main.css` (legacy Less)
  - `build/resources/main/assets/styles/tailwind.css` (NEW)

### Admin tool HTML

- [ ] Edit `src/main/resources/admin/tools/main/main.html`:
  - [ ] Add `<link rel="stylesheet" href="…/styles/tailwind.css">` AFTER the existing `main.css` link.

### ESLint

- [ ] Edit `eslint.config.ts`:
  - [ ] Add `.tsx` to file matchers.
  - [ ] Add `no-restricted-imports` banning `q` and `Q.defer` under `src/main/resources/assets/js/v2/**`.

## Files to add / change

- `package.json` — deps + scripts
- `gradle.properties` — `libAdminUiVersion` bump
- `vite.config.ts` — Preact aliases, JSX config
- `vite.config.css.mjs` — NEW
- `tsconfig.json` — JSX + paths
- `src/main/resources/assets/styles/tailwind.css` — NEW
- `src/main/resources/admin/tools/main/main.html` — link tag
- `gradle/node.gradle` — pnpm task wiring
- `eslint.config.ts` — JSX + restrictions

## Acceptance criteria

- [ ] `./gradlew :pnpmInstall :pnpmCheck :pnpmBuild` runs green.
- [ ] `build/resources/main/assets/styles/tailwind.css` exists and is non-empty.
- [ ] Admin tool loads in browser, no visual change, no console errors.
- [ ] WDIO/Playwright smoke tests still pass.

## Notes / gotchas

- **Don't change** the existing Less build — it must keep emitting `main.css` for the legacy UI.
- **`emptyOutDir: false`** on the Tailwind Vite config is critical or it wipes parallel JS output.
- **Tailwind layer order** is declared up front with `@layer theme, base, legacy, utilities, overrides;`. Tailwind v4 doesn't infer order from `@import …layer(x)`.
- **`@source` paths** use `node_modules/@enonic/lib-admin-ui/`, NOT `.xp/dev/lib-admin-ui/` — pnpm symlinks lib-admin-ui into the standard node_modules location once the dev-resources jar is unpacked.

## Open questions

- [ ] After install, run `pnpm why nanostores` — if both `^0.11` (our pin) and `~1.3` (lib-admin-ui's own dep) are resolved, decide whether to override. Note that lib-admin-ui's `ui2/LegacyElement` imports `nanostores.map` — if two instances coexist the `MapStore` identity check inside `useStore` may fail.
