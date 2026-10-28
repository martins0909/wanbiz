# Wanbiz EventPass

Wanbiz is a TanStack Start application. The browser UI lives in `src/routes` and `src/components`; server-only code and API handlers live in `src/lib/server` and `src/routes/api.*`. The UI and API are built and deployed together as one Node.js service.

## Local development

Requirements: Node.js 22+ and Bun.

```powershell
bun install
Copy-Item .env.example .env
bun run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). There is one same-origin application, so use a single root `.env`: secret values stay on the Node server and should never use a `VITE_` prefix. The Node server reads `.env` for local production starts; Render receives server values through its Environment settings.

## Server and database

MongoDB, Resend, Cloudinary and session credentials are server-only. Never rename them with a `VITE_` prefix: Vite exposes `VITE_*` values to browser code. For MongoDB Atlas, create a database user and allow the Render outbound IP policy (or the Atlas network access policy you choose). Generate `SESSION_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

`/api/health` pings MongoDB and is Render's health check. MongoDB-backed account sessions, password reset email, event drafts, and admin user/event controls are implemented. The initial admin is created on its first successful login using `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`; do not email that password, and change it through the password-recovery flow after Resend is configured.

This is still a prototype: public event discovery, tickets, wallet and membership use demo data; payment checkout is deliberately disabled; receipt storage and live QR check-in are not implemented. Event images uploaded with event drafts are stored in Cloudinary and their URLs are saved in MongoDB. The admin payments tab only shows records that already exist in MongoDB. Do not enable live payments until event inventory, ownership checks, idempotent fulfillment and ticket issuance are implemented.

## Deploy to Render

Create a Render Blueprint from this repository using `render.yaml`. Set `MONGODB_URI` to a MongoDB Atlas connection string and configure the prompted admin, session, Resend and Cloudinary secrets in Render's Environment settings. The service builds with Nitro's `node-server` preset and starts the generated Node server. Render supplies the public URL after deployment.

## Useful commands

```sh
bun run dev
bun run build
bun run start
bun run lint
```
