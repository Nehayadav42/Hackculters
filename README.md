# HeritageVerse

HeritageVerse is a digital archive for exploring Indian heritage through a public storytelling experience and an authenticated monument collection. The frontend is built with React and Vite; the API uses Express and Supabase.

## What works today

- Public landing page with archive, manuscript, architecture, and interactive stepwell sections. Some landing-page content is curated demo data.
- Supabase authentication with protected dashboard and monument routes.
- Dashboard and monument collection read records from the backend API.
- Monument detail pages show available record fields, images, coordinates, and related documents.
- Dashboard contributions are stored in Supabase Storage, processed by the Python OCR service, and saved as completed document records before the upload returns.
- Saved discoveries do not persist yet; there is no user-specific bookmark API.
- Manuscripts are shown through monument records; there is no separate manuscript listing API.
- AI chat, AI summaries, 3D model metadata, and manuscript translation currently return simulated responses or data.

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
   SUPABASE_DOCUMENTS_BUCKET=heritage-archives
   PYTHON_OCR_URL=http://localhost:8000/process-document
   ```

   `SUPABASE_DOCUMENTS_BUCKET` defaults to `heritage-archives`; set it to the existing document bucket if the project uses a different name. The bucket must allow uploads and public reads for original-document links. The backend Supabase key/policies must allow document insert/update. `PYTHON_OCR_URL` is optional when the Python service runs locally at the shown address. The repository has no SQL migrations; check the deployed bucket and policies before running.

3. Install Python OCR dependencies and start the OCR service:

   ```powershell
   cd ocr-service
   pip install -r requirements.txt
   python app.py
   ```

4. Start the API and frontend in separate terminals:

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
- `POST /api/v1/ai/ocr` — multipart OCR upload; file field is `document`, with optional source/target language and document type. Results are saved to the same document archive.
- `GET /api/v1/monuments/search/all?q=...` — archive search.
- `GET /api/v1/monuments/manuscript/:word` — currently returns a fixed translation example.
- `GET /api/v1/monuments/:id/3d-model` — currently returns placeholder model metadata.
- `POST /api/v1/ai/summarize` and `POST /api/v1/ai/chat` — currently return mock responses.

## Database and integration notes

There are no database migrations or schema definitions in this repository; the Supabase schema is external and must be checked before changing it. Monument and archive search query `heritage_sites` and `documents`. Document uploads use existing `documents` fields for the file reference/name/type, source/language metadata, OCR/translation text, OCR engine/confidence metadata, and `status`. Upload status transitions through `processing`, `completed`, or `failed`; the deployed `status` column and its policies must allow these values.

Both upload interfaces send the uploaded file bytes to the Python OCR service. Files are stored under the configured documents bucket; the OCR process does not fetch files from Cloudinary or rely on public URL access. PDF uploads are limited to 25 MB.

## Checks

```powershell
cd Frontend
npm run lint
npm run build
```
