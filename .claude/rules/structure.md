---
paths:
  - 'src/main/resources/assets/js/**'
---

# Frontend structure

Feature-Sliced Design. Mirrors app-settings' `structure.md`, minus everything about a shell: this app
has no rail, no registry and no router, and `app/` holds the bootstrap and one component.

Imports run one way, no exceptions:

```
app  →  pages  →  widgets / features  →  entities  →  shared
```

| Layer                 | Holds                                                | Never                             |
| --------------------- | ---------------------------------------------------- | --------------------------------- |
| `app/`                | `mount` glue, bootstrap, `App`                       | domain logic                      |
| `pages/applications/` | composition, entity → view-model mapping             | reusable logic                    |
| `widgets/`            | section-agnostic composite blocks (browse framework) | domain words, `entities/` imports |
| `features/<action>/`  | one user action: dialog, wizard, command             | any import to or from `widgets/`  |
| `entities/<domain>/`  | `api/`, `model/`, sometimes `ui/`                    | UI beyond a domain row or badge   |
| `shared/`             | host, routing, api, config, i18n, ui, …              | importing anything above          |

- **`widgets/` and `features/` never import each other**, either direction. A domain-agnostic
  component both a page and a feature need goes in `shared/ui/`, not `widgets/` — `shared/ui/dialogs/`
  is the case.
- **This app is one section.** `pages/applications/` is the only page and nothing below `pages/` may
  assume otherwise, switch on a section id, or count them.
- Segments are fixed and keep their suffix: `*.api.ts`, `*.store.ts`, `*.service.ts`, `*.types.ts`,
  `use<Thing>.ts`. `api/` and `model/` exist even for one file. `entities/application/` is the shape.
- `shared/` and `entities/` slices are consumed through their `index.ts`; `widgets/` and `pages/`
  components by file path. A `features/` barrel carries commands, stores and types — **never
  components**, or a test importing an action list pulls in `@enonic/ui`.
- Components: `export function Name()`, props type `<Name>Props`, no default exports. Folders
  kebab-case, atoms prefixed `$`.

## i18n

Every user-visible string goes through `shared/i18n`, and phrases arrive from the `phrases(locale)`
root field at bootstrap — never from a page. A component names its strings at the top with
`useI18n(key)` and renders them by name; a list of `labelKey` items goes through `useLabelled`;
`i18n(key, …values)` is for where no hook fits. **Never resolve a phrase at module scope** — that runs
before the bootstrap and freezes `#key#`; a module constant holds keys. New keys extend
`applications.<area>.<name>`; `browse.*` belongs to the widgets.
