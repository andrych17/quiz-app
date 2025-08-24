# Quiz App — Test & Assessment Platform

A Next.js (App Router) based quiz application built for internal assessments. It features an admin panel for managing quizzes and participants, and a public interface for test takers accessed via unique tokens. This project is suitable for a portfolio to showcase full‑stack skills with TypeScript, React, and Tailwind.

Quick overview:
- Roles: Admin (authenticated) & Public (test taker)
- Storage: In-memory mock database (demo only)
- Test behavior: Single submission per participant (no retakes)

## Key Features

### Admin (Authenticated)
- Simple demo login
- Manage quizzes: create, edit, publish/unpublish
- Manage questions: add single-choice, multiple-select (checkbox), and free-text questions
- View and filter participant attempts per quiz
- Basic statistics and CSV export for reporting
- Generate shareable token/link for each quiz

### Public (No Login Required)
- Access quizzes via a tokenized URL
- Client-side validation with Zod + React Hook Form
- Multi-page tests with pagination
- Supports single-choice (radio) and multiple-select (checkbox) questions
- Case-insensitive scoring; results are not shown immediately (no-retake policy)

## Tech Stack

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS
- shadcn/ui (optional components)
- react-hook-form + zod (validation)

## Demo Credentials

Use the demo admin account to access the dashboard:

- Email: `admin@example.com`
- Password: `password`

## Running Locally

Recommended (pnpm):

```powershell
pnpm install
pnpm dev
```

Or using npm:

```powershell
npm install
npm run dev
```

Open http://localhost:3000 (or the port printed in the terminal).

## Project Structure (brief)

```
src/
	app/           # App Router pages (admin, public, api)
	components/    # UI components (Navigation, Sidebar, public quiz form)
	lib/           # mock DB, utilities, scoring
	types/         # TypeScript definitions
```

## How It Works

- Each quiz has a unique token; participants submit name + NIJ and answers → stored in the mock DB
- The system prevents the same NIJ from submitting more than once per quiz
- Multiple-select questions are validated by exact-match of all correct choices (order-insensitive)

## Notes for Portfolio

Include these when presenting the project:

- Admin dashboard screenshots (quiz list, basic stats)
- Participant flow screenshots (enter details → answer pages → submit)
- Example token link used for a public quiz
- Highlight: multiple-select implementation and single-submission enforcement
- Mention trade-offs: in-memory storage for demo simplicity; can be replaced with persistent DB (Postgres, Firebase, etc.)

Suggested talking points for interviews:

- App Router architecture and protected admin routes
- Form validation approach with zod + react-hook-form
- Scoring and normalization logic (case-insensitive comparison, exact-match for multiple-select)
- Next steps: add persistent storage, real authentication, result review features

## License

Demo repository — use for portfolio and learning purposes.

---

If you want, I can also add placeholder screenshots, badges (tech/CI), or short captions for demo images in the README — should I add those?
