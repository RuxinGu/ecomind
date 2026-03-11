# EcoMind App (Mobile + Backend MVP)

EcoMind is a reflection-first dating/social app with this flow:

1. Welcome
2. Signup / Login
3. Quick profile
4. EcoMind test (short or long)
5. 8-dimension results + resonance matches
6. Chat space (Soul Lounge)

## Tech stack

- Mobile: Expo + React Native + TypeScript
- Backend API: Node.js + Express
- Database: PostgreSQL (`pg`)
- Security: bcrypt password hashing, rate-limiting, anti-spam checks

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3) Configure backend env

```bash
cp apps/backend/.env.example apps/backend/.env
```

### 4) Start backend

```bash
npm run dev:backend
```

Backend runs on `http://localhost:4000`.

### 5) Seed demo users (optional)

```bash
npm run seed
```

Demo account: `ava@example.com` / `password123`

### 6) Start mobile app

```bash
npm run dev:mobile
```

- Press `i` for iOS simulator.
- Press `a` for Android emulator.

If your simulator cannot reach localhost, use:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4000 npm run dev:mobile
```

## Backend production hardening included

- Password hashing migrated from SHA256 to bcrypt (`bcryptjs`)
- Global + auth + signup + chat rate limiting
- Login brute-force tracking and temporary lockout by email+IP
- Chat anti-spam controls (minimum send interval + duplicate suppression)
- CORS allowlist via `CORS_ORIGIN`
- Helmet security headers

## API overview

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `PUT /profile`
- `GET /questionnaire/:formType` (`short` or `long`)
- `POST /questionnaire/submit`
- `GET /matches`
- `GET /chat/messages?roomId=soul-lounge`
- `POST /chat/messages`
- `POST /safety/report`
- `POST /safety/block`
- `POST /safety/unblock`
- `GET /safety/blocks`
- `DELETE /account`

## Deploy API over HTTPS

### Option A: Render (config included)

1. Push repo to GitHub.
2. Create Render Blueprint from `render.yaml`.
3. Set `CORS_ORIGIN` to your production app origin(s).
4. Render provisions PostgreSQL + HTTPS API automatically.

### Option B: Any container host (Railway/Fly/Cloud Run)

1. Use [`apps/backend/Dockerfile`](/Users/guruxin/Documents/Playground/apps/backend/Dockerfile).
2. Set env vars from [`apps/backend/.env.example`](/Users/guruxin/Documents/Playground/apps/backend/.env.example).
3. Point `DATABASE_URL` to managed Postgres.
4. Ensure TLS/HTTPS terminates at your hosting edge.

## App Store launch path (practical)

1. Create Apple Developer account and app record in App Store Connect.
2. Replace placeholder bundle id (`com.ecomind.app`) with your real id.
3. Add privacy policy URL and support URL.
4. Add moderation review dashboard for handling reports before review.
5. Keep account deletion flow in-app (already implemented in this MVP).
6. Add legal docs in-app: Terms, Privacy, Community Guidelines.
7. Build with EAS:

```bash
cd apps/mobile
npx eas login
npx eas build:configure
npx eas build -p ios --profile production
```

8. Submit with `npx eas submit -p ios`.
9. Complete App Privacy nutrition labels accurately.

Prep docs created in repo:
- [App Store Connect checklist](/Users/guruxin/Documents/Playground/docs/app-store-connect-prep.md)
- [App Privacy data map draft](/Users/guruxin/Documents/Playground/docs/app-privacy-data-map.md)
