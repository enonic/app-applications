---
paths:
  - '**/*.tsx'
---

# Preact

Mirrors app-settings' `preact.md`, minus its router notes — this app has none.

- Preact 10. `react`, `react-dom`, `react-dom/client` and `react/jsx-runtime` are aliased to
  `preact/compat` in `vite.config.ts` and `tsconfig.json`, so both runtimes are one. Radix ref type
  mismatches through `@enonic/ui` are expected.
- Hooks come from `preact/hooks`. Type-only imports from `react` (`ReactNode`, `Ref`) are fine and
  resolve through the alias.
- A component renders; it does not do I/O. Effects belong to a screen hook —
  `useApplicationsScreen()` starts the load and returns nothing — or to a store's service.
- `useMemo` for a derivation the render repeats, keyed on what it reads. A fresh vnode per row is
  correct: Preact writes into a vnode as it renders it.
- Hooks before any early return, and never conditional — put the branch inside the call
  (`useI18n(stoppable ? a : b)`).
