# Test Management Tool MVP

A full-stack test management platform with:
- JWT auth and role-based access (`admin`, `tester`)
- Test Case CRUD
- Test Run management
- Test Result recording (`passed`, `failed`, `blocked`)
- Dashboard analytics and filters

## Stack
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Tests:** Jest + Supertest (backend), React Testing Library + Vitest (frontend)
- **Deployment:** Docker + Docker Compose

## Project Structure
- `backend/` Express API + Prisma schema/migrations + Jest tests
- `frontend/` React app with routes/pages/components + RTL tests
- `postman/` API collection
- `docker-compose.yml` Full local stack

## Environment Variables
### Backend (`backend/.env`)
Use `backend/.env.example`:
- `PORT=4000`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/test_management?schema=public`
- `JWT_SECRET=change_this_secret`
- `JWT_EXPIRES_IN=1d`
- `CORS_ORIGIN=http://localhost:5173`

### Frontend (`frontend/.env`)
Use `frontend/.env.example`:
- `VITE_API_BASE_URL=http://localhost:4000`

## Local Run (without Docker)
1. Start PostgreSQL and create DB.
2. Backend:
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Docker Run
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## API Summary
- `POST /auth/register`
- `POST /auth/login`
- `GET /dashboard/summary`
- `GET /testcases`, `POST /testcases`, `GET /testcases/:id`, `PUT /testcases/:id`, `DELETE /testcases/:id`
- `GET /testruns`, `POST /testruns`
- `POST /testruns/:id/results`, `GET /testruns/:id/results`

Protected endpoints require `Authorization: Bearer <token>`.

## Tests
Backend:
```bash
cd backend
npm test
```
Frontend:
```bash
cd frontend
npm test
```

## Postman
Import `postman/test-management.postman_collection.json`.
