# Project Specific Instructions

## Project Description
This application shows the galaxy for a specific user of the game Nexus Legacy. The current state is how a particular user sees the galaxy depending on how much they have explored space.

The galaxy consists of 6 spiral arms: alpha, beta, gamma, delta, epsilon, and zeta. Each arm consists of 47 sectors. Each sector consists of 50 star systems.

Systems can be of the following types:
- neutron
- white_dwarf
- red_dwarf
- orange
- yellow
- blue_giant

Each system consists of planets and asteroid fields.

## Language Policy
<rule severity="critical">
- **Always write all agent files (e.g., AGENTS.md, ARCHITECTURE.md) and code comments in English.**
</rule>

## Coding Standards & Type Safety
<rule severity="high">
- **Do not use the `any` type in the application.** Always use proper TypeScript types, generics, `unknown`, or interfaces instead of `any`.
- **Never use linter or TypeScript suppressions** (e.g., `@ts-ignore`, `@ts-expect-error`, `eslint-disable`). Fix the underlying type or linting issues properly instead.
- **Atomic UI Components Approach:** Decompose large components into smaller, modular, and single-responsibility atomic components (e.g., splitting headers, filter selectors, stats, charts, or popup sub-panels into distinct files). Ensure each atomic component remains isolated and has clear prop definitions.
</rule>

## Application Architecture
<rule severity="high">
- **Read the [ARCHITECTURE.md](./.agents/ARCHITECTURE.md) file** when you need to understand the structural context of the application, component responsibilities, or where to add new features.
- **Always update the [ARCHITECTURE.md](./.agents/ARCHITECTURE.md) file** when adding new logic, new features, or refactoring the application.
</rule>

## Testing and Verification Policy
<rule severity="high">
- **Always run unit tests** (`npm run test` or `npx vitest run`), **linter**, and **type checking** (`npm run lint` / `tsc --noEmit` or use `lint_applet`) after completing any coding task or making code changes.
- If the tests, linter, or type checking fail, analyze the error and attempt to fix the code.
- You have a maximum of **3 iterations** to fix failing checks.
- If the checks still fail after 3 iterations, stop attempting to fix them and conclude the task by providing detailed feedback to the user regarding the failure and current state.
- **NEVER modify the tests themselves** to make them pass when attempting to fix test failures. You must fix the application code to satisfy the existing tests.
</rule>

