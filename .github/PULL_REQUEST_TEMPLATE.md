## Description
<!-- Describe the changes in this PR. What problem does it solve? -->

## Architecture Checklist
<!-- Reviewers will check these before merging. Please ensure you have followed the guidelines. -->
- [ ] No direct Supabase calls in UI components (used `src/services/`)
- [ ] Wrapped network calls in React Query hooks
- [ ] Used `src/theme/tokens.ts` for all colors and spacing
- [ ] Form payloads validated with Zod
- [ ] Loading states and Error states handled gracefully

## Database Changes
- [ ] Does this PR alter the database schema?
- [ ] If yes, is there a new migration file in `supabase/migrations/`?
- [ ] If yes, has `src/types/database.ts` been updated?

## Screenshots/Video (if UI changed)
<!-- Attach screenshots or videos here -->
