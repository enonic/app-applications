---
paths:
  - '**/*.{ts,tsx}'
---

# TypeScript

Mirrors app-settings' `typescript.md`.

- `strict: true`, target ES2023, native TypeScript 7, `noEmit` — the bundlers emit. Client config is
  the root `tsconfig.json`, server config `src/main/resources/tsconfig.json`.
- Formatting is oxfmt's: 2-space, single quotes, sorted imports and Tailwind classes. Never hand-format.
- `type` over `interface`. No `enum` — a union of string literals, or `as const`.
- **No `any`, and a cast is a boundary marker.** Where one is unavoidable it names the wire it crosses
  and says so in a comment: `toApplicationsMessage` in `shared/admin-events` is the pattern.
- `unknown` for what arrives from outside, narrowed by a predicate before use — `app/bootstrap.ts`
  parses the config that way.
- Optional over nullable in domain types: an api mapper turns `null` into `undefined` so nothing
  downstream tests both.
- Named exports only. `UPPER_SNAKE` for module constants, `PascalCase` for types and components,
  `camelCase` otherwise, `$` prefix for atoms.
