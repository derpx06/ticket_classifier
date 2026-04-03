# Backend

## Setup (MongoDB)

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Set Mongo connection in `.env`:
- `MONGODB_URI` (required)
- `MONGODB_DB_NAME` (optional, defaults to `ticket_classifier`)

4. Initialize connection and indexes:

```bash
npm run db:setup
```

5. Start dev server:

```bash
npm run dev
```

API base URL: `http://127.0.0.1:5000/api` (or your `PORT`).

## Tech Stack

- Node.js + TypeScript
- Express 5
- MongoDB (`mongodb` driver)
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Validation (`zod`)
- Testing (`vitest`, `supertest`)

## Folder Structure

```text
backend/
├── db/                    # legacy SQL files (not used by Mongo runtime)
├── src/
│   ├── config/            # env + Mongo connection/index setup
│   ├── controllers/       # auth and team endpoints
│   ├── db/                # DB readiness helpers
│   ├── middleware/        # auth/admin middleware
│   ├── routes/            # API routing
│   ├── schemas/           # zod schemas
│   ├── types/             # shared TS types (Express auth context)
│   ├── utils/             # DB setup/test + permission helpers
│   ├── app.ts             # express app wiring
│   └── index.ts           # server startup
├── .env.example
├── package.json
└── tsconfig.json
```
