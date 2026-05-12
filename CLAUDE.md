# app-applications

## Migration workflow (`docs/migration/`)

When working on a phase in `docs/migration/`:

1. **Verify the build before committing.** After finishing a step, run `pnpm run check` and `pnpm run build` (or `./gradlew :pnpmCheck :pnpmBuild`) — both must succeed cleanly. Do not commit if either fails.
2. **Mark the step done in the docs.** Tick the relevant `- [ ]` checkboxes in the phase doc (`docs/migration/NN-*.md`) and update the **Status** column in `docs/migration/README.md` to `Done` in the same commit as the step.
3. **Push to `claude/migrate-app-ui-framework-g4OPC` directly.** That branch is the single integration branch for the migration; no intermediate per-phase branches.
4. **Start each new step on the latest `claude/migrate-app-ui-framework-g4OPC`.** Before doing anything else, `git fetch origin claude/migrate-app-ui-framework-g4OPC` and rebase/check-out from it.
