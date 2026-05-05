# Stump

A spaced-repetition quiz app built with React, TypeScript, and Bun. Study decks are organized by subject, and the quiz engine re-queues missed questions until every card is mastered. Progress and badge counts persist in localStorage with no backend database required.

## Features

- Spaced-repetition quiz engine: incorrect answers are re-queued twice before a question can be mastered
- Badge progression per deck: Bronze (1 completion), Silver (2), Gold (10), Diamond (100)
- Folder-level deck merging so you can quiz across an entire subject at once
- Patreon OAuth integration for user identification
- All state stored locally in the browser

## Getting Started

**Prerequisites:** [Bun](https://bun.sh) installed.

```bash
bun install
bun run dev
```

This starts the Bun backend on port 3001 and the Vite dev server on port 5173 concurrently.

## Environment Variables

Copy `.env.example` to `.env` and fill in your Patreon OAuth credentials:

```
PATREON_CLIENT_ID=
PATREON_CLIENT_SECRET=
PATREON_REDIRECT_URI=http://localhost:3001/api/auth/patreon/callback
FRONTEND_URL=http://localhost:5173
```

Register a client and get credentials at the [Patreon developer portal](https://www.patreon.com/portal/registration/register-clients).

When deploying to Vercel, set only `PATREON_CLIENT_ID` and `PATREON_CLIENT_SECRET`. The redirect URI and frontend URL are auto-detected from the incoming request.

## Adding Decks

Create a JSON file under `decks/<subject>/<deck>.json`:

```json
{
  "name": "Deck Name",
  "description": "optional",
  "questions": [
    {
      "id": "unique-id",
      "question": "What is the answer?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}
```

`correctAnswer` is the zero-based index into `options`. The quiz shuffles display order at runtime, so the stored index is always relative to the original array. Decks nested in subdirectories are automatically grouped into a folder on the selection screen.

## Building

```bash
bun run build    # Type-check and bundle for production
bun run preview  # Preview the production build locally
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Bun (Patreon OAuth only)
- **Routing:** React Router v7
- **Storage:** localStorage (no database)
