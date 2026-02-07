# UN Office for Partnerships Dashboard (Vite + React)

This repo is ready for **GitHub + Codespaces**.

## Quick start (Codespaces / local)

```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Configure API base URL

This app calls your backend proxy endpoints to avoid browser CORS limitations.

Create a `.env` file in the repo root:

```bash
VITE_API_BASE_URL=https://your-backend.example.com
```

Endpoints expected (best-effort / graceful fallback to demo data):
- `GET /api/catalog/sources`
- `GET /api/health/:sourceId`
- `GET /api/kpis/global`
- `GET /api/unop/news`

If you don't have a backend yet, the UI still runs using demo data.
