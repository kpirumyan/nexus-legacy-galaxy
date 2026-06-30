# Project Specific Instructions

## Application Architecture
- **Read the [ARCHITECTURE.md](./.agents/ARCHITECTURE.md) file** when you need to understand the structural context of the application, component responsibilities, or where to add new features.
- **Always update the [ARCHITECTURE.md](./.agents/ARCHITECTURE.md) file** when adding new logic, new features, or refactoring the application.

## Testing Policy
- **Always run unit tests** (`npm run test` or `npx vitest run`) after completing any coding task or making code changes.
- If the tests fail, analyze the error and attempt to fix the code or the tests.
- You have a maximum of **3 iterations** to fix failing tests.
- If the tests still fail after 3 iterations, stop attempting to fix them and conclude the task by providing detailed feedback to the user regarding the failure and current state.
