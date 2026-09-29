# Contributing to Vastré

Thank you for contributing! As our team grows, we rely on a strict Pull Request review process to ensure code quality.

## Development Workflow
1. **Branching:** Create a feature branch off `main` (e.g., `feat/closet-grid` or `fix/auth-crash`).
2. **AI Assistance:** If using an AI assistant (like Antigravity), point them to `AI_INSTRUCTIONS.md` before generating code.
3. **Run Checks Locally:**
   - Ensure the app builds without errors: `npx expo start`
   - Verify TypeScript compiles: `npx tsc --noEmit`
4. **Pull Request:** Open a PR against `main` and fill out the provided template.

## Code Review Expectations
Reviewers will reject PRs that:
- Hardcode UI colors or spacing (bypassing `tokens.ts`).
- Mix UI code with raw Supabase queries.
- Do not handle error states or loading states.
- Introduce database schema changes without a corresponding SQL migration file.
