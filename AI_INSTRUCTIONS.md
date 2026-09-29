# Vastré - Developer & AI Guidelines

Welcome to the Vastré codebase! To maintain our enterprise-grade architecture, all human developers and AI coding agents MUST adhere strictly to the following rules.

## 1. Architecture Rules (The Golden Rules)
- **NO DIRECT DATABASE QUERIES IN UI:** Never import `supabase` directly into a React component. All database calls must be written inside `mobile/src/services/` (Data Access Layer).
- **REACT QUERY REQUIRED:** All UI components fetching data must use a `@tanstack/react-query` hook (e.g., `useActiveCloset`) to ensure caching and offline support. 
- **ZOD VALIDATION:** Any form submission or payload creation MUST be validated against schemas in `src/lib/validations.ts` before calling a service.

## 2. UI & Styling Rules
- **NO HARDCODED COLORS:** Never write `color: '#FFF'` or `padding: 16`. You MUST import `colors` and `spacing` from `src/theme/tokens.ts`.
- **ATOMIC COMPONENTS:** Reusable elements (Buttons, Cards, Inputs) must be created in `src/components/ui/` rather than duplicated across screens.
- **EXPO ROUTER:** We use file-based routing. Do not use `react-navigation` directly. Use `useRouter()` from `expo-router` for imperative navigation.

## 3. Backend & Database Rules
- **MIGRATIONS ONLY:** Never manually edit the database in the Supabase UI. All schema changes must be written as SQL files inside `supabase/migrations/`.
- **TYPESCRIPT SYNC:** If the database schema changes, the `src/types/database.ts` file MUST be updated to reflect the exact Postgres Row types.
- **SOFT DELETES:** Never use `DELETE FROM`. Update the `deleted_at` timestamp to preserve relational integrity.
- **NO HARDCODED SECRETS:** Never hardcode API keys, tokens, or sensitive URLs in code. Always use `process.env` and the `.env` file.

## 4. Error Handling
- **GLOBAL BOUNDARIES:** Do not let components crash. Let unhandled errors bubble up to the `ErrorBoundary`.
- **SERVICE RESPONSES:** All services must return `{ data, error, success }`. The UI must check `!success` and display appropriate user feedback.

*By adhering to these rules, Vastré will remain secure, scalable, and easy to maintain as the team grows.*
