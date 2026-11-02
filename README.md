# HeritageVerse

HeritageVerse is a digital archive for exploring Indian heritage through a public storytelling experience and an authenticated monument collection. The frontend is built with React and Vite; the API uses Express and Supabase.

## What works today

- Public landing page with archive, manuscript, architecture, and interactive stepwell sections. Some landing-page content is curated demo data.
- Supabase authentication with protected dashboard and monument routes.
- Dashboard and monument collection read records from the backend API.
- Monument detail pages show available record fields, images, coordinates, and related documents.
- Dashboard contribution form sends archive files to the existing multipart upload endpoint.
- Saved discoveries do not persist yet; there is no user-specific bookmark API.
- Manuscripts are shown through monument records; there is no separate manuscript listing API.
- AI chat, AI summaries, 3D model metadata, manuscript translation, and OCR extraction currently return simulated responses or data.

## Run locally

Requirements: Node.js, a Supabase project, and the services needed by the backend features you want to test.

1. Install frontend and backend dependencies:

   ```powershell
   cd Frontend
   npm install
   cd ..\Backend
   npm install
   ```

2. Configure environment variables in local `.env` files. Never commit credentials.

   Frontend (`Frontend/.env`):

   ```text
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

   Backend (`Backend/.env`):

   ```text
   PORT=5000
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   REDIS_URL=redis://127.0.0.1:6379
   ```

3. Start the API and frontend in separate terminals:

   ```powershell
   cd Backend
   npm run dev
   ```

   ```powershell
   cd Frontend
   npm run dev
   ```

Vite proxies `/api` requests to `http://localhost:5000`. The backend currently allows the local Vite origin `http://localhost:5173`.

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | HeritageVerse landing experience |
| `/auth` | Public | Sign in and sign up |
| `/dashboard` | Authenticated | Overview, profile, and archive contributions |
| `/monuments` | Authenticated | Browse and filter live heritage records |
| `/monuments/:id` | Authenticated | Monument details and related documents |

## Current API surface

- `GET /api/v1/monuments` — list records and filter by `state`, `category`, `period`, or `search`.
- `GET /api/v1/monuments/map-data` — map records.
- `GET /api/v1/monuments/:id` — monument details and related documents.
- `POST /api/v1/monuments/upload` — multipart upload; file field is `archive_file`, with `monument_id`, `title`, and `category`.
- `GET /api/v1/monuments/search/all?q=...` — archive search.
- `GET /api/v1/monuments/manuscript/:word` — currently returns a fixed translation example.
- `GET /api/v1/monuments/:id/3d-model` — currently returns placeholder model metadata.
- `POST /api/v1/ai/summarize` and `POST /api/v1/ai/chat` — currently return mock responses.

## Database and integration notes

There are no database migrations or schema definitions in this repository; the Supabase schema is external and must be checked before changing it. The monument list/detail service queries `heritage_sites`, while archive search queries a separate `monuments` table. Monument detail currently selects `documents.category`; if the deployed `documents` table does not have that column, the detail request will fail until the database/schema or query is reconciled. This repository does not apply database changes automatically.

The OCR worker is simulated and depends on Redis. File uploads depend on Cloudinary configuration and successful document persistence. Verify those external services and the Supabase schema in the target environment before presenting a live upload as complete.

## Checks

```powershell
cd Frontend
npm run lint
npm run build
```
