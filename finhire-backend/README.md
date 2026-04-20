# FinHire Finder Service

A full-stack TypeScript platform for connecting businesses with financial experts (accountants, CFOs, AR/revenue collection specialists).

## Features Implemented

- User registration/login for `BUSINESS` and `EXPERT`
- Expert profile creation/update
- Expert search with filters:
  - location
  - expertise type
  - minimum years of experience
  - minimum rating
- Quote request flow (businesses -> experts)
- Quote status update flow (experts)
- Review system (businesses review experts)

## Tech Stack

- Backend: Node.js + TypeScript + Apollo GraphQL + PostgreSQL + Prisma ORM
- Frontend: React + TypeScript + Vite + Apollo Client
- Auth: JWT + bcrypt password hashing

## Backend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   ```

3. Create Postgres database (e.g. `finhire`) and run Prisma client generation:

   ```bash
   npm run prisma:generate
   ```

4. Start dev server:

   ```bash
   npm run dev
   ```

GraphQL endpoint: `http://localhost:4000`

## Frontend Setup

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Configure frontend environment:

   ```bash
   cp .env.example .env
   ```

3. Run frontend in dev mode:

   ```bash
   npm run dev
   ```

Frontend URL: `http://localhost:5173`

## Scripts

- `npm run dev` - Start in watch mode
- `npm run build` - TypeScript compile
- `npm run start` - Run compiled code from `dist`

## Suggested AI Extension

Add an AI assistant resolver (or a separate service) that:

- helps businesses choose the right expert type
- suggests top matches using profile + review signals
- answers onboarding/FAQ questions
