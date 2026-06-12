# Overview & principles

## Why this migration

`app-applications` today is fully class-based `lib-admin-ui` (`AppPanel`, `BrowsePanel`, `ModalDialog`, `ListBox`, `ItemStatisticsPanel`, …). All server I/O goes through `ResourceRequest` (XHR + `q` promises). There is no centralized state — panels listen to `ApplicationEvent` and custom events, then imperatively poke each other's DOM. Styling is Less only.

`app-contentstudio` has already moved to Preact + nanostores + Tailwind v4 + `fetch`. `lib-admin-ui` ships `ui2/LegacyElement` as the bridge between legacy `Element`s and Preact components, plus `form2/` as the new input-type system. The component library `@enonic/ui` (`enonic/npm-enonic-ui`) provides 33 atomic and composite components with Tailwind v4 tokens.

The surface of `app-applications` is small (~45 TS files, 8 Less files, no wizard) — so we do a **full migration** rather than CS's gradual side-by-side approach. New code lives in `v2/`; legacy `app/` is deleted phase by phase.

## Target stack

| Concern | Choice | Pin |
|---|---|---|
| Framework | Preact (React aliased to `preact/compat`) | `^10.29` |
| Components | `@enonic/ui` | `~1.0.0-beta.1` |
| Styling | Tailwind v4 + `@enonic/ui/preset.css` | `^4.3` |
| Animations | `tw-animate-css` | `^1.3` |
| State (core) | `nanostores` | `^0.11.4` |
| State (Preact binding) | `@nanostores/preact` | `^1.0.0` |
| HTTP | native `fetch()` + `AbortSignal.timeout` | n/a |
| Bridge | `@enonic/lib-admin-ui/ui2/LegacyElement` | matches CS pin |
| Headless deps | `@radix-ui/react-slot`, `focus-trap-react`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge` | match CS pins |
| Build | Vite 7 — JS pipeline + separate CSS pipeline for Tailwind | existing |
| E2E | `@playwright/test` | `^1.49` |

Versions track `app-contentstudio` master. The `lib-admin-ui` snapshot version follows whatever `gradle.properties.libAdminUiVersion` is on CS master at the time of the bump.

## Principles

1. **No custom `ui2/`-style wrappers in our code.** We don't replicate `lib-admin-ui`'s pattern of wrapping every `@enonic/ui` component in a `LegacyElement` subclass. `LegacyElement` is used exactly **once**, at the top of the tree, to host the entire Preact app inside the existing `ApplicationAppPanel`.
2. **Stores own truth; events feed stores; components read stores.** Replace today's "events poke panels" pattern with "events update store, components subscribe via `useStore`".
3. **`v2/` is the only new code location.** Legacy `app/` files are deleted, not modified.
4. **Plain fetch, no shared client.** Each endpoint is a single `async function` in `v2/features/api/*.ts` (mirrors CS `api/publish.ts` shape).
5. **No backwards-compatibility shims.** When we delete a legacy file, we delete it cleanly. If something else imports it, fix the import.
6. **Test before you ship.** Playwright must be green before every UI-feature PR merges.
7. **JSON DTOs at boundaries.** Don't store class instances (`Application`, `ApplicationInfo`) in stores — define flat `ApplicationDto` and convert at the edges. Methods that need behaviour can be derived helpers.

## Directory layout target

```
src/main/resources/assets/js/
  main.ts                       # Boot — mounts AppElement (Preact root)
  v2/
    App.tsx                     # Single Preact root component
    shared/
      LegacyElement.tsx         # Bridge subclass (wraps IdProvider)
      ui/                       # Local UI primitives (Badge, Spinner, etc.) if needed
    features/
      api/                      # fetch wrappers
        applications.ts
        install.ts
        market.ts
        errors/AppError.ts
      store/                    # nanostores
        app.store.ts
        applications.store.ts
        app-actions.store.ts
        market.store.ts
        upload.store.ts
        dialogs.store.ts
      events/
        applicationEvents.ts    # WS → store bridge
      utils/
        url/api.ts
        storage/sync.ts
    views/
      browse/
        BrowsePage.tsx
        BrowseGrid.tsx
        BrowseToolbar.tsx
        ...
      install/
        InstallDialog.tsx
        MarketGrid.tsx
        UploadDropZone.tsx
      detail/
        DetailPanel.tsx
        sections/...
```

Legacy `app/`, `installation/`, `view/`, `resource/`, `browse/` directories are removed as their successor phases complete.

## Sources of truth

- Verbatim code templates from CS to copy: [references.md](./references.md)
- This plan: 11 phase docs in this directory, indexed from [README.md](./README.md)

## Conventions

- Use `.tsx` for files containing JSX; `.ts` for pure logic.
- Each store file ends in `.store.ts`; each API file lives under `api/`.
- Each component file is `PascalCase.tsx`.
- Imports inside `v2/` use relative paths; imports from lib-admin-ui or `@enonic/ui` use the package name.
- ESLint forbids `q` and `Q.defer` in `v2/`; use `async/await` everywhere.
- TypeScript stays at `strictNullChecks: false` for now (matches CS) — revisit later.
