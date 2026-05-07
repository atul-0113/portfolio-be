# PortfolioPro Backend

PortfolioPro Backend is a Node.js + Express API for a multi-tenant portfolio and resume SaaS platform.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- File uploads
- Redis (TODO Later)
- BullMQ (TODO Later)
- OpenAI SDK (TODO Later)
- Stripe/Razorpay SDK (TODO Later)

## Core Features

### Authentication

- JWT Auth
- Refresh Tokens
- RBAC
- Email verification (TODO Later)

### Portfolio Engine

- Dynamic section architecture
- Template builder (TODO Later)
- Public portfolio APIs

### Resume Suite (TODO Later)

- Resume builder APIs
- ATS scoring engine
- PDF generation

### AI Layer (TODO Later)

- AI content generation
- ATS keyword analysis
- Theme suggestions
- Portfolio optimization

### SaaS Infrastructure

- Subscription handling
- Billing webhooks (TODO Later)
- Email queues (TODO Later)
- File uploads

## Architecture

```bash
src/
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── portfolios/
│   ├── templates/
│   ├── resumes/
│   ├── ai/
│   ├── billing/
│   └── admin/
├── middleware/
├── services/
├── utils/
├── jobs/
├── prisma/
└── index.js
```

## Setup

Use Node.js `22.12.0`.

```bash
nvm use
npm install
npm run prisma:generate
```

Set the required environment variables:

```bash
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_be?schema=public
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_EXPIRES_IN=7d
```

## Scripts

```bash
npm run dev
npm start
npm test
npm run prisma:generate
```

## API Entrypoints

- `GET /health`
- `/api/auth`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- `/api/users`
  - `GET /api/users` admin only
- `/api/categories`
  - `GET /api/categories`
  - `POST /api/categories` admin only
  - `PATCH /api/categories/:id` admin only; supports `isActive`
- `/api/templates`
- `/api/portfolios`
- `/api/resumes` (TODO Later placeholder)
- `/api/ai` (TODO Later placeholder)
- `/api/billing` (TODO Later placeholder)
- `/api/admin` (TODO Later placeholder)
