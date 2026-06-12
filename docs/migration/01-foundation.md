# Phase 1 — Foundation

**Status:** Done
**Depends on:** —
**Blocks:** 2, 3, 4

## Goal

Add Preact, `@enonic/ui`, Tailwind v4, and nanostores to `app-applications` without changing any visible UI. After this phase, `pnpm build` produces a `tailwind.css` next to the existing `main.css`, the admin tool HTML loads both, and the runtime has Preact + `@enonic/ui` available — but no Preact component is mounted yet.

## Tasks

### Dependencies

- [x] Bump `gradle.properties.libAdminUiVersion` to match `app-contentstudio` master.
- [x] Add to `package.json` `dependencies`:
  - [x] `@enonic/ui: ~1.0.0-beta.1`
  - [x] `preact: ^10.29`
  - [x] `nanostores: ^0.11.4`
  - [x] `@nanostores/preact: ^1.0.0`
  - [x] `@radix-ui/react-slot: ^1.2`
  - [x] `focus-trap-react: ^11.0`
  - [x] `lucide-react: ^0.577`
  - [x] `class-variance-authority: ^0.7`
  - [x] `clsx: ^2.1`
  - [x] `tailwind-merge: ^3.0`
- [x] Add to `package.json` `devDependencies`:
  - [x] `tailwindcss: ^4.3`
  - [x] `@tailwindcss/vite: ^4.3`
  - [x] `tw-animate-css: ^1.3`
- [x] `pnpm install` clean (no resolution warnings beyond peer ranges).

### Vite config

- [x] Edit `vite.config.ts` (JS pipeline):
  - [x] Add `resolve.alias`:
    - `react → preact/compat`
    - `react-dom → preact/compat`
    - `react/jsx-runtime → preact/jsx-runtime`
    - `react/jsx-dev-runtime → preact/jsx-dev-runtime`
  - [x] Add `resolve.dedupe: ['preact', 'preact/compat']`
  - [x] Add `optimizeDeps.include: ['preact', 'preact/hooks', 'preact/compat', '@enonic/ui']`
  - [x] Set `esbuild.jsx: 'automatic'`, `esbuild.jsxImportSource: 'preact'`
- [x] Create `vite.config.css.mjs` — see [references.md §1](./references.md#1-viteconfigcssmjs).
  - [x] `@tailwindcss/vite` plugin
  - [x] Input: `src/main/resources/assets/styles/tailwind.css`
  - [x] Output to `build/resources/main/assets/styles/` with `emptyOutDir: false`

### TypeScript

- [x] Edit `tsconfig.json`:
  - [x] Add `"jsx": "react-jsx"`
  - [x] Add `"jsxImportSource": "preact"`
  - [x] Add `paths`: `{"react": ["node_modules/preact/compat"], "react-dom": ["node_modules/preact/compat"]}`
  - [x] `**/*.tsx` covered by existing `src/**/*` include glob.
- [x] `pnpm exec tsc --noEmit` clean.

### Tailwind entry

- [x] Create `src/main/resources/assets/styles/tailwind.css` — see [references.md §2](./references.md#2-tailwindcss).

### Gradle / pnpm scripts

- [x] Add npm scripts to `package.json`:
  - [x] `build:dev:tailwind`: `vite build --config vite.config.css.mjs --mode development`
  - [x] `build:prod:tailwind`: `vite build --config vite.config.css.mjs --mode production`
  - existing `build:dev` / `build:prod` wrappers (`pnpm --color /^build:dev:.*$/`) pick up the new sibling automatically.
- [x] `gradle/node.gradle` already invokes `pnpm build` via the auto-generated `pnpmBuild` task; no change needed.
- [x] Verify `pnpm build:dev` produces:
  - `build/resources/main/assets/js/bundle.js`
  - `build/resources/main/assets/styles/main.css` (legacy Less)
  - `build/resources/main/assets/styles/tailwind.css` (NEW)

### Admin tool HTML

- [x] Edit `src/main/resources/admin/tools/main/main.html`:
  - [x] Add `<link rel="stylesheet" href="…/styles/tailwind.css">` AFTER the existing `main.css` link.

### ESLint

- [x] Edit `eslint.config.ts`:
  - [x] `.tsx` already covered by existing `["**/*.ts", "**/*.tsx"]` files matcher.
  - [x] Add `no-restricted-imports` banning `q` under `src/main/resources/assets/js/v2/**`.

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

- [x] `pnpm install`, `pnpm check`, `pnpm build:dev` run green locally (Gradle equivalents to be confirmed on CI).
- [x] `build/resources/main/assets/styles/tailwind.css` exists and is non-empty (≈ 88 kB).
- [ ] Admin tool loads in browser, no visual change, no console errors. *(Manual; deferred to CI / preview env.)*
- [ ] WDIO/Playwright smoke tests still pass. *(Deferred to CI.)*

## Notes / gotchas

- **Don't change** the existing Less build — it must keep emitting `main.css` for the legacy UI.
- **`emptyOutDir: false`** on the Tailwind Vite config is critical or it wipes parallel JS output.
- **Tailwind layer order** is declared up front with `@layer theme, base, legacy, utilities, overrides;`. Tailwind v4 doesn't infer order from `@import …layer(x)`.
- **`@source` paths** use `node_modules/@enonic/lib-admin-ui/`, NOT `.xp/dev/lib-admin-ui/` — pnpm symlinks lib-admin-ui into the standard node_modules location once the dev-resources jar is unpacked.

## Open questions

- [ ] After install, run `pnpm why nanostores` — if both `^0.11` (our pin) and `~1.3` (lib-admin-ui's own dep) are resolved, decide whether to override. Note that lib-admin-ui's `ui2/LegacyElement` imports `nanostores.map` — if two instances coexist the `MapStore` identity check inside `useStore` may fail.
