# HeritageVerse

HeritageVerse turns cultural and architectural heritage records into a public, searchable archive. Visitors can explore records, maps, documents, and interactive architectural visualizations. Signed-in contributors can add archive material through the dashboard.

## Features

- Public record browsing, detail pages, archive search, and a location map.
- A collapsible workspace sidebar shared across archive, map, explorer, and account pages; Back returns to the previous distinct page.
- An authenticated dashboard for document and photo contributions.
- OCR, transcription, translation, and transliteration through the Python service.
- Archive-grounded AI summaries and record Q&A powered by one server-side Gemini service; OCR, translation, and transliteration continue through the Python service.
- The Evidence Gap Lens highlights which record layers are present (location, imagery, documents, transcription, and provenance). It measures record coverage, not historical accuracy.
- An interactive, geometry-based stepwell visualization. It is an interpretation, not a photogrammetry scan or verified digital twin.
- A separate Bhopal 3D city mode using Cesium ion's OSM Buildings asset 96188. City-scale OSM geometry is not a surveyed or accurate model of any named monument.
- Gohar Mahal and Taj-ul-Masajid detail pages link to their corresponding Bhopali.in 3D map views in a new tab. These are external references, not downloadable or surveyed models.

The archive map uses OpenStreetMap embeds and does not require a Mapbox or Google Maps API key. The Cesium city mode uses OpenStreetMap imagery and requires a restricted Cesium ion browser token for the OSM Buildings asset.

## Run locally

Requirements: Node.js, a Supabase project, Cloudinary credentials for file uploads, and Python for OCR.

1. Install frontend and backend dependencies:

   ```powershell
   cd Frontend
   npm install
   cd ..\Backend
   npm install
   ```

2. Configure local environment files. Never commit credentials.

   `Frontend/.env.local`:

   ```text
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_CESIUM_ION_TOKEN=...
   ```

   `Backend/.env`:

   ```text
   PORT=5000
   FRONTEND_ORIGINS=http://localhost:5173
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   PYTHON_OCR_URL=http://localhost:8000/process-document
   GEMINI_API_KEY=...
   GEMINI_MODEL=gemini-2.5-flash
   ```

   `VITE_CESIUM_ION_TOKEN` is needed only for the Bhopal 3D city mode. Vite embeds `VITE_` values in browser code, so use a restricted Cesium ion browser token with only the required asset access and allowed origins; never use an account-secret token. The city mode shows a setup message when this token is missing and leaves the procedural monument viewer available.

   `GEMINI_MODEL` is optional. AI endpoints return a clear service-unavailable response until `GEMINI_API_KEY` is configured. Keep the key only in `Backend/.env`; do not put it in the frontend or share it in chat.

3. Start the API and frontend in separate terminals:

   ```powershell
   cd Backend
   npm run dev
   ```

   ```powershell
   cd Frontend
   npm run dev
   ```

   Vite proxies `/api` requests to `http://localhost:5000`.

4. To enable OCR, install the Python service dependencies and start the service from its directory:

   ```powershell
   cd ocr-service
   pip install -r requirements.txt
   python app.py
   ```

   The API uploads supported source files to Cloudinary and sends them to this service for processing. OCR availability depends on the configured service and OCR engine. The current text-translation adapter uses MyMemory; Google Cloud credentials are only needed if enabling Google Cloud Vision.

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page with public archive information |
| `/auth` | Public | Sign in and sign up |
| `/monuments` | Public | Browse heritage records |
| `/monuments/:id` | Public | View a record, related documents, and images |
| `/archive/search` | Public | Search records and archive documents |
| `/map` | Public | Explore records by location |
| `/explorer` | Public | Interactive monument interpretations and Bhopal city-scale 3D view |
| `/dashboard` | Authenticated | Manage profile and contribute archive material |

## API

- `GET /api/v1/monuments` — list public records; supports `state`, `category`, `period`, and `search` filters.
- `GET /api/v1/monuments/map-data` — public map pins.
- `GET /api/v1/monuments/:id` — public record details and related documents.
- `GET /api/v1/monuments/:id/images` — public record images.
- `GET /api/v1/monuments/search/all?q=...` — public archive search.
- `POST /api/v1/monuments/upload` — authenticated Cloudinary document upload and OCR processing.
- `POST /api/v1/monuments/:id/images` — authenticated photo upload to the Supabase `heritage-archives` bucket.
- `POST /api/v1/ai/summarize` and `POST /api/v1/ai/chat` — Gemini-backed, archive-grounded assistance.
- `POST /api/v1/ai/ocr` and `GET /api/v1/ai/ocr/:id` — authenticated OCR processing and retrieval.

## Storage and database

Document uploads use Cloudinary and save their public file URL in Supabase. Monument photos use Supabase Storage in the `heritage-archives` bucket and are registered in the `media` table. Contributions require a valid Supabase access token; the backend forwards it to a request-scoped Supabase client so row-level security can apply.

This repository does not include database migrations. The deployed Supabase schema and row-level-security policies must provide the tables and columns used by the API, including `heritage_sites`, `documents`, `media`, and the `heritage-archives` storage bucket. Verify the schema and policies before enabling contributions in production.

## Checks

```powershell
cd Frontend
npm run lint
npm run build
```
