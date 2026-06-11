# TaskFlow — Production Deployment Guide

## Architecture

```
Vercel (Frontend)          Render (Backend)          MongoDB Atlas
React + Vite        →      Node.js + Express   →     Cloud Database
https://*.vercel.app       https://*.onrender.com    Atlas Free Tier
```

- **Frontend**: React 18, Vite, React Router v6 — deployed to Vercel
- **Backend**: Node.js, Express, JWT auth — deployed to Render (free tier)
- **Database**: MongoDB Atlas (free M0 tier, 512 MB)

All API calls are proxied through `VITE_API_URL`. No hardcoded URLs anywhere.

---

## Prerequisites

- GitHub account (repo already pushed)
- [MongoDB Atlas](https://cloud.mongodb.com) account
- [Render](https://render.com) account (connect GitHub)
- [Vercel](https://vercel.com) account (connect GitHub)

---

## Step 1 — MongoDB Atlas

1. Log in → **New Project** → create cluster (free M0 tier)
2. **Database Access** → Add user → username + password → role: `readWriteAnyDatabase`
3. **Network Access** → Add IP → `0.0.0.0/0` (allow all — required for Render dynamic IPs)
4. **Connect** → Drivers → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   Replace `<username>` and `<password>` with your DB user credentials.

---

## Step 2 — Render (Backend)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `Jitesh2604/Avidus_Assignment`
3. Configure:

   | Field | Value |
   |---|---|
   | **Name** | `taskflow-backend` (or any name) |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node src/app.js` |
   | **Instance Type** | Free |

4. Under **Environment Variables**, add all of the following:

   | Key | Value |
   |---|---|
   | `PORT` | `5001` |
   | `MONGO_URI` | Your Atlas connection string (from Step 1) |
   | `JWT_SECRET` | A random 64+ character string (see tip below) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | Your Vercel URL (add after Step 3, e.g. `https://taskflow.vercel.app`) |

   > **Tip — generate a secure JWT_SECRET:**
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   > ```

5. Click **Create Web Service**. Wait for the first deploy to succeed.
6. Copy your service URL: `https://taskflow-backend.onrender.com`

---

## Step 3 — Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo: `Jitesh2604/Avidus_Assignment`
3. Configure:

   | Field | Value |
   |---|---|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://taskflow-backend.onrender.com/api` |

   Replace the URL with your actual Render service URL from Step 2.

5. Click **Deploy**. Wait for build to complete.
6. Copy your Vercel URL: `https://taskflow.vercel.app`

7. **Go back to Render** → your backend service → Environment → update `CLIENT_URL` to your Vercel URL → **Save Changes** (triggers a redeploy).

---

## Step 4 — Verify Deployment

After both services are live:

```bash
# 1. Health check
curl https://taskflow-backend.onrender.com/api/health

# Expected:
# {"status":"ok","timestamp":"..."}

# 2. Test registration
curl -X POST https://taskflow-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"user"}'

# 3. Test login
curl -X POST https://taskflow-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Then open the Vercel URL in a browser and test the full flow manually.

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the server listens on (`5001`) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens (min 64 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default: `7d`) |
| `NODE_ENV` | Yes | Set to `production` to suppress error details |
| `CLIENT_URL` | Yes | Vercel frontend URL for CORS allow-list |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Full URL to backend API including `/api` suffix |

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env         # fill in your values
npm install
node src/app.js              # runs on PORT from .env

# Frontend (new terminal)
cd frontend
# No .env needed — Vite proxies /api to localhost backend
npm install
npm run dev                  # runs on http://localhost:5173
```

The Vite dev proxy in `vite.config.js` forwards all `/api` requests to the backend.
`VITE_API_URL` is intentionally left unset locally so the proxy takes over.

---

## Known Limitations (Free Tiers)

| Platform | Limitation |
|---|---|
| Render free | Service sleeps after 15 min of inactivity; first request takes ~30s to cold-start |
| MongoDB Atlas M0 | 512 MB storage, shared cluster, no dedicated resources |
| Vercel free | 100 GB bandwidth/month, serverless functions limited |

---

## Security Notes

- **Admin self-registration is enabled** by design (the Register page has a role selector). In a real production app, restrict this to invite-only or seed the first admin manually via the DB.
- **Rate limiting** is not implemented. If deploying publicly, add `express-rate-limit` on `/api/auth/login` and `/api/auth/register`.
- **JWT tokens are stored in `localStorage`**. This is acceptable for this project scope but consider `httpOnly` cookies for higher-security requirements.
- **`NODE_ENV=production`** must be set on Render — this suppresses internal error details from API responses.
- Rotate `JWT_SECRET` immediately if the repo was ever public with the old secret committed.

---

## Production Deployment Checklist

### MongoDB Atlas
- [ ] Cluster created (free M0 tier)
- [ ] Database user created with strong password
- [ ] Network access set to `0.0.0.0/0`
- [ ] Connection string copied

### Render (Backend)
- [ ] Root directory set to `backend`
- [ ] Start command: `node src/app.js`
- [ ] `PORT=5001` set
- [ ] `MONGO_URI` set to Atlas connection string
- [ ] `JWT_SECRET` set to a fresh 64+ char random string (not the dev value)
- [ ] `NODE_ENV=production` set
- [ ] `CLIENT_URL` set to Vercel URL
- [ ] First deploy succeeded
- [ ] `/api/health` returns `200 OK`

### Vercel (Frontend)
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Vite
- [ ] `VITE_API_URL` set to Render backend URL + `/api`
- [ ] Build succeeds (`✓ built in ~555ms`)
- [ ] App loads in browser without console errors
- [ ] SPA routing works (refresh on `/dashboard` does not 404)

### End-to-End
- [ ] User registration works
- [ ] User login works and redirects to dashboard
- [ ] Admin login works and redirects to admin panel
- [ ] Task create / update / delete works
- [ ] Admin can view users, tasks, activity logs
- [ ] Deactivating a user blocks their login
- [ ] 401 response redirects to login page
