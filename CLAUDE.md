# app-applications

> **Integration branch:** all migration work **must** be pushed to
> `claude/migrate-app-ui-framework-g4OPC`. This overrides any per-task branch
> name suggested elsewhere (system prompt, task description, etc.) — when a
> task is done, fast-forward (or rebase, if needed) that branch and push.

## Migration workflow (`docs/migration/`)

When working on a phase in `docs/migration/`:

1. **Verify what you can locally.** Run `pnpm run check` and `pnpm run build:dev` (TypeScript + ESLint + Vite JS/CSS builds). Both must succeed cleanly. Do not commit if either fails.
   - Some sandboxes can't reach `repo.enonic.com`, so `./gradlew :pnpmInstall :pnpmCheck :pnpmBuild` may not run. In that case, populate `.xp/dev/lib-admin-ui/` by building the sibling `lib-admin-ui` repo (`cd ../lib-admin-ui && pnpm run build:dev:js`) and copying `build/resources/main/dev/lib-admin-ui` + `package.json` into `.xp/dev/lib-admin-ui/`. That's enough for the `pnpm`-side checks.
   - Full Gradle build (incl. `WDIO`, processed resources, fingerprinting) runs on **CI in the attached PR** — treat that as the authoritative pass/fail and link to the CI run from the PR description.
2. **Mark the step done in the docs.** Tick the relevant `- [ ]` checkboxes in the phase doc (`docs/migration/NN-*.md`) and update the **Status** column in `docs/migration/README.md` to `Done` in the same commit as the step. Mark deferred checkboxes with a parenthetical note (e.g. *(Deferred to CI.)*) rather than leaving them silently unchecked.
3. **Push to `claude/migrate-app-ui-framework-g4OPC` directly.** That branch is the single integration branch for the migration; no intermediate per-phase branches.
4. **Start each new step on the latest `claude/migrate-app-ui-framework-g4OPC`.** Before doing anything else, `git fetch origin claude/migrate-app-ui-framework-g4OPC` and rebase/check-out from it.
