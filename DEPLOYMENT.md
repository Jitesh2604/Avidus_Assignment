# TaskFlow — Production Deployment Guide

## Live URLs

| Service | URL |
|---|---|
| **Frontend** | https://taskflow-frontend-pi-mocha.vercel.app |
| **Backend API** | https://avidus-taskflow-api.vercel.app |
| **Health check** | https://avidus-taskflow-api.vercel.app/api/health |

---

## Architecture

```
Vercel (Frontend)                    Vercel (Backend)               MongoDB Atlas
React + Vite                  →      Node.js + Express       →      Cloud Database
taskflow-frontend-pi-mocha          avidus-taskflow-api             cluster0.hp93grv
```

- **Frontend**: React 18, Vite, React Router v6 — Vercel project `taskflow-frontend`
- **Backend**: Node.js, Express, JWT auth — Vercel project `avidus-taskflow-api` (serverless)
- **Database**: MongoDB Atlas free M0 tier (`cluster0.hp93grv.mongodb.net`)

Both frontend and backend are deployed on Vercel. The backend runs as a Vercel serverless function — all routes are handled by `backend/src/app.js` via `backend/vercel.json`.

---

## Prerequisites

- GitHub account (repo: `Jitesh2604/Avidus_Assignment`)
- [MongoDB Atlas](https://cloud.mongodb.com) account
- [Vercel](https://vercel.com) account

---

## Step 1 — MongoDB Atlas

1. Log in → create a free **M0** cluster
2. **Database Access** → Add user → username + password → role: `readWriteAnyDatabase`
3. **Network Access** → Add IP → `0.0.0.0/0` (required — Vercel uses dynamic IPs)
4. **Connect** → Drivers → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

---

## Step 2 — Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo `Jitesh2604/Avidus_Assignment`
3. Configure:

   | Field | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Framework Preset** | Other |
   | **Build Command** | *(leave blank)* |
   | **Output Directory** | *(leave blank)* |
   | **Install Command** | `npm install` |

4. Add environment variables:

   | Key | Value |
   |---|---|
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | Random 64+ char string (see tip below) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | Your frontend Vercel URL |

   > **Generate JWT_SECRET:**
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   > ```

5. Click **Deploy**. Once live, copy the URL (e.g. `https://avidus-taskflow-api.vercel.app`).

---

## Step 3 — Deploy Frontend to Vercel

1. **Add New Project** → same repo → different root directory
2. Configure:

   | Field | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

3. Add environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://avidus-taskflow-api.vercel.app/api` |

4. Click **Deploy**.

5. Copy the frontend URL and go back to the **backend project** → Settings → Environment Variables → update `CLIENT_URL` to the frontend URL → trigger a redeploy.

---

## Step 4 — Verify Deployment

```bash
# Health check
curl https://avidus-taskflow-api.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test registration
curl -X POST https://avidus-taskflow-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"user"}'

# Test login
curl -X POST https://avidus-taskflow-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## Environment Variables Reference

### Backend (Vercel project: `avidus-taskflow-api`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens (min 64 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default: `7d`) |
| `NODE_ENV` | Yes | Set to `production` to suppress error details in responses |
| `CLIENT_URL` | Yes | Frontend Vercel URL for CORS allow-list |

### Frontend (Vercel project: `taskflow-frontend`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Full URL to backend API including `/api` suffix |

---

## How the Backend Works on Vercel (Serverless)

The backend uses a lazy MongoDB connection pattern compatible with Vercel's serverless runtime:

- `backend/vercel.json` routes all requests to `src/app.js`
- A middleware checks `mongoose.connection.readyState` before each request and connects if needed — mongoose caches the connection across warm invocations
- `app.listen()` is skipped when `VERCEL=1` (set automatically by Vercel)

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env         # fill in MONGO_URI, JWT_SECRET etc.
npm install
node src/app.js              # runs on http://localhost:5001

# Frontend (new terminal)
cd frontend
# No .env needed — Vite proxies /api to localhost backend
npm install
npm run dev                  # runs on http://localhost:5173
```

The Vite dev proxy in `vite.config.js` forwards all `/api` requests to the local backend.
`VITE_API_URL` is intentionally left unset locally so the proxy takes over.

---

## Known Limitations (Free Tier)

| Platform | Limitation |
|---|---|
| Vercel serverless | 10s function timeout; cold starts on first request after inactivity |
| MongoDB Atlas M0 | 512 MB storage, shared cluster, no dedicated resources |
| Vercel free | 100 GB bandwidth/month, 12 serverless function deployments per day |

---

## Security Notes

- **Admin self-registration is enabled** by design (Register page has a role selector). In a real production app restrict this to invite-only or seed the first admin directly in the DB.
- **Rate limiting** is not implemented. Add `express-rate-limit` on `/api/auth/login` and `/api/auth/register` before exposing publicly.
- **JWT tokens are stored in `localStorage`**. Acceptable for this scope; consider `httpOnly` cookies for stricter security.
- **`NODE_ENV=production`** must be set — this suppresses internal `err.message` details from API error responses.

---

## Production Checklist

### MongoDB Atlas
- [x] Cluster created (free M0 tier) — `cluster0.hp93grv.mongodb.net`
- [x] Database user created
- [x] Network access set to `0.0.0.0/0`
- [x] Connection string set in Vercel backend env vars

### Vercel — Backend (`avidus-taskflow-api`)
- [x] Root directory: `backend`
- [x] `backend/vercel.json` present — routes all traffic to `src/app.js`
- [x] `MONGO_URI` set
- [x] `JWT_SECRET` set (64-char random string)
- [x] `JWT_EXPIRES_IN=7d` set
- [x] `NODE_ENV=production` set
- [x] `CLIENT_URL` set to frontend URL
- [x] `/api/health` returns `{"status":"ok"}`

### Vercel — Frontend (`taskflow-frontend`)
- [x] Root directory: `frontend`
- [x] Framework preset: Vite
- [x] `VITE_API_URL=https://avidus-taskflow-api.vercel.app/api`
- [x] Build succeeds
- [x] SPA routing works (refresh on `/dashboard` does not 404)

### End-to-End
- [x] User registration works
- [x] User login works and redirects to dashboard
- [x] Admin login works and redirects to admin panel
- [ ] Task create / update / delete works
- [ ] Admin can view users, tasks, activity logs
- [ ] Deactivating a user blocks their login
- [ ] 401 response redirects to login page
