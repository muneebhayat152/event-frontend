# Event Management System — Frontend

React 19 single-page application for the EMS platform.

**Live:** [https://muneebhayat152-ems.vercel.app/](https://muneebhayat152-ems.vercel.app/)

## Stack

- React 19 + Vite 8
- React Router 7
- Axios (Sanctum Bearer tokens)
- Tailwind CSS
- React Toastify, Recharts (admin analytics)

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` to your Laravel API host (see root `README.md`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (Vercel) |
| `npm run lint` | ESLint |

## Deploy (Vercel)

- Root directory: `frontend` (if monorepo) or repo root
- Environment: `VITE_API_URL` = production API URL
- `vercel.json` handles SPA routing

See the main project README in the parent folder for architecture and API details.
