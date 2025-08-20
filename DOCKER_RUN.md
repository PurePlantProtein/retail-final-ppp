Local Docker deployment (cheapest single-droplet approach)

This repo includes a simple Docker Compose setup that runs:
- Postgres
- A minimal Node API (server/) that provides auth and endpoints used by the frontend
- An Nginx-served frontend built from `npm run build`

Quick start (on a machine with Docker):

1. Copy example envs if needed:
   cp .env.example .env

2. Build and start services:
   docker compose -f docker-compose.yml up -d --build

3. Open http://localhost in your browser.

Notes:
- The API is on port 4000 and proxies are configured so the frontend can call `/api/*`.
- The Postgres data is stored in a Docker volume named `dbdata`.
- For production on a Droplet, clone the repo on the droplet and run the same `docker compose up -d --build`.
- You must secure secrets (JWT_SECRET, etc.) and configure TLS before public production use.

Implemented function endpoints
 - The following Supabase Functions are stubbed and available at `/api/functions/:name`:
    - `send-order-email`, `send-tracking-email`, `send-user-notification`, `send-bulk-order-email`
    - These currently log payloads and return `{ ok: true }`. Integrate an email provider later.

Storage
 - Marketing uploads available at `/api/storage/marketing/upload` (POST multipart/form-data file field named `file`).
 - Files can be downloaded at `/api/storage/marketing/:file`.
