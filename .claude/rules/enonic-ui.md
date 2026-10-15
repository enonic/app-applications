---
paths:
  - 'src/main/resources/assets/js/**/*.tsx'
---

# @enonic/ui and Tailwind

Mirrors app-settings' `enonic-ui.md`, plus the shadow-root half, which only a provider pays.

- **Read the component source before composing a compound component** — in `node_modules/@enonic/ui`,
  or `../npm-enonic-ui` where that checkout is present. Several
  fail silently on a wrong child or a missing part rather than throwing.
- Tailwind v4, classes sorted by oxfmt. Use the library's tokens (`text-subtle`, `bg-main`,
  `var(--color-info)`) rather than raw palette values, so the theme applies.
- `cn` from `@enonic/ui` for conditional classes.

## Inside the shadow root

The section renders in an open shadow root the host creates, and that is permanent.

- `AppRoot` (`app/App.tsx`) adopts the stylesheet from `$stylesheets`, sets the theme class inside the
  root and portals overlays inside it. Nothing may render to `document.body`.
- `.dark` never crosses the boundary — read the theme from `host.theme`, never from the document.
- `shared/styles/stylesheet.ts` fetches `_static/main.css` into a `CSSStyleSheet` and publishes it
  only once loaded, because `AppRoot` reads the rules for its `@property` fallback. Fonts come from
  the host page.
- **Every new overlay component has to be checked in the shadow root by hand.** Popovers, menus,
  tooltips and dialogs are where this breaks, and no test here can catch it — the environment is
  `node`.
