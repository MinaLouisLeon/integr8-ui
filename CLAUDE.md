# CLAUDE.md — integr8-ui

This repo is `@integr8-media/ui`: the design system for every @integr8-media app (shadcn/ui on Radix + Tailwind v4, four themes including the Integr8 brand theme, form kit, data table, command palette, app layout pieces). It is build step 2 of the Integr8 Workbench project. Tooling comes from `@integr8-media/config` (already published).

**The source of truth for what to build is `docs/SPEC.md`.** Read it fully before writing code. If something is unclear or the spec seems wrong, stop and ask; do not guess or change the public API.

## Rules for Claude Code

- **Never run commands.** No tests, typecheck, lint, build, install, Ladle, Playwright or git push. The developer runs every command. (Lefthook's quick pre-commit Biome check runs automatically when you commit; that is fine.)
- Write tests and Ladle stories for every feature, but do not run them.
- Commit only on a `feature/*` branch created from `dev`. Never commit to `main` or `dev`.
- **Ask first** before:
  - adding or upgrading a dependency that is not in the spec's approved list (give name, reason, approximate size, license, and wait for approval; then add it to package.json and let the developer run the install);
  - changing the public API defined in docs/SPEC.md (component names, props, exports, theme tokens);
  - pushing a branch or opening a pull request.
- **Never**: push to main or dev, bump versions, create tags, publish to npm, or add an npm token.
- When you finish a task, reply with: files created or changed, what is left, and the exact commands the developer should run to check the work.
- Work in small steps the developer can review: theme engine first, then basics, then form kit, data table, command/menus, layout pieces, registry.

## Code conventions

- Node 24 LTS, React 19, TypeScript strict (via `@integr8-media/config/tsconfig/react-library.json`), ES modules only.
- Layout: `src/index.ts` exports the public API only; components in `src/components/<group>/`; theme code in `src/theme/`; tests next to the code (`useTheme.test.ts` beside `useTheme.ts`); Ladle stories in `playground/`; `docs/` for SPEC.md and guides.
- Published files: `"files": ["dist"]` only (built JS, types, CSS files, fonts and registry JSON all land in dist). No source maps that contain source.
- File names: camelCase for non-components (`cn.ts`, `useTheme.ts`, `themeScript.ts`); PascalCase for React component files (`Button.tsx`, `DataTable.tsx`).
- Named exports only; no default exports (except `*.config.ts` files that require them).
- Components: forward refs, accept `className`, merge with `cn()`, variants with class-variance-authority, accessibility from Radix, respect `prefers-reduced-motion`.
- Styling only through the theme tokens (CSS variables); never hard-code colors inside components.
- Errors: export typed error classes with codes (for example `ThemeError` with `UNKNOWN_THEME`); never throw plain strings.
- TSDoc comments on every public export.
- Formatting (Biome preset): 2-space indent, line width 100, single quotes in TS, double quotes in JSX, semicolons always, trailing commas everywhere.

## Docs in this repo

- `README.md`: what it is, install, setup for Tailwind v4 apps and for apps without Tailwind, themes, quick example, registry usage, non-goals.
- `docs/SPEC.md`: the locked spec (do not edit without approval).
- API reference generated from TSDoc with TypeDoc.

## Git and versions

- Branches: `main` (released), `dev` (integration), `feature/<name>` from dev. Pull requests go into dev; dev is merged into main for a release.
- Versions are bumped by hand by the developer.
- First publish: the developer publishes once by hand from their machine, then adds a trusted publisher on npmjs.com (GitHub Actions, this repo, workflow `release.yml`).
- Release: merge dev into main, push a tag `vX.Y.Z`; `.github/workflows/release.yml` (copied from the integr8-config template) builds, tests and publishes through npm trusted publishing (OIDC). No npm token exists in the repo or its secrets; never add one. This repo is private, so no npm provenance.

## CI and hooks

- CI runs on pull requests into dev only (shared `pr-checks.yml` from integr8-config): lint, typecheck, tests with an 80% line-coverage floor, bundle size, export checks (publint, attw). No OS matrix for this package.
- Lefthook (extends `@integr8-media/config/lefthook/base.yml`): pre-commit = Biome on staged files; pre-push = typecheck, test:coverage, build, playground:smoke.
