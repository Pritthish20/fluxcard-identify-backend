# Fluxcard Identify Backend

A small Express + Prisma backend for contact identity reconciliation.

The service accepts an `email`, `phoneNumber`, or both, then returns a consolidated contact view by:

- creating a new primary contact when no match exists
- linking matching records into one cluster
- preserving the oldest primary contact as the canonical identity
- creating a secondary contact when new information is introduced

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod

## Project Structure

```text
src/
  app.ts                 Express app
  server.ts              Local server entrypoint
  config/db.ts           Prisma + Postgres setup
  routes/                Route wiring
  controller/            Request handlers
  services/              Identity resolution logic
  schema/                Zod request schema
  middleware/            Validation middleware
prisma/
  schema.prisma          Database schema
  migrations/            Prisma migrations
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
PORT=3000
```

Vercel Postgres also works through `POSTGRES_URL`.

## Local Setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Server runs on `http://localhost:3000` by default.

## API

### `POST /identify`

Request body:

```json
{
  "email": "doc@example.com",
  "phoneNumber": "9999999999"
}
```

At least one of `email` or `phoneNumber` is required.

Example response:

```json
{
  "data": {
    "primaryContactId": 1,
    "emails": ["doc@example.com", "doc.alt@example.com"],
    "phoneNumbers": ["9999999999"],
    "secondaryContactIds": [2]
  },
  "message": "User data processed successfully"
}
```

## Available Scripts

- `npm run dev` starts the local TypeScript dev server
- `npm run build` compiles to `dist/`
- `npm run start` runs the compiled server
- `npm run prisma:generate` regenerates the Prisma client
- `npm run prisma:migrate` creates and applies a local dev migration
- `npm run prisma:migrate:deploy` applies migrations in deploy environments

## Deployment

This project is prepared for Vercel:

- `vercel.json` enables Fluid compute
- Prisma client is generated during install/build
- the database layer supports `DATABASE_URL` and `POSTGRES_URL`
- pooled Postgres connections are attached to the Vercel function lifecycle

Before deploying, set the database URL in Vercel project environment variables.

## Notes

- Generated Prisma client code lives in `src/generated/prisma`
- build output goes to `dist/`
- there are currently no automated tests
