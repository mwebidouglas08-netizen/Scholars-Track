# ScholarsTrack — Graduate Research Progress System

A full-stack web application for tracking postgraduate student research progress from department level through to the postgraduate board.

---

## 🔐 Admin Credentials

| Field    | Value                           |
|----------|---------------------------------|
| Email    | `admin@scholarstrack.edu`       |
| Password | `Admin@ScholarsTrack2024`       |
| URL      | `/admin/login` (separate portal)|

> Change these in production via environment variables: `ADMIN_EMAIL` and `ADMIN_PASSWORD`

---

## ✨ Features

### Student Portal (`/login`, `/register`)
- Register with name, email, phone, registration number, academic level, department
- Submit proposals, results, presentations, and publications
- Track progress through Department → School Faculty → Postgraduate Board
- View automatic weighted scores (Proposal 35%, Results 30%, Presentation 20%, Publication 15%)
- Receive real-time notifications from administrators
- Message moderators directly

### Admin Portal (`/admin/login` — completely separate)
- Dashboard with system statistics and student distribution
- Full student management (add, edit, remove)
- Review and score all submissions stage by stage
- Send broadcast or targeted notifications
- Read and reply to student messages
- Add/remove additional admin moderators

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, React Router  |
| Backend   | Node.js, Express, TypeScript        |
| Database  | SQLite via better-sqlite3 + Drizzle ORM |
| Auth      | Express Sessions + bcryptjs         |
| Styling   | Pure CSS (no UI framework)          |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/scholarstrack.git
cd scholarstrack

# Install root deps
npm install

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env — change SESSION_SECRET at minimum
```

### 3. Run development servers

```bash
# From root — runs both frontend and backend
npm run dev

# Or individually:
cd backend && npm run dev     # API on http://localhost:5000
cd frontend && npm run dev    # UI on  http://localhost:5173
```

The admin account is auto-created on first backend start.

---

## 🚂 Deploy on Railway (Step by Step)

### Step 1: Push to GitHub
```bash
cd scholarstrack
git init
git add .
git commit -m "Initial commit — ScholarsTrack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/scholarstrack.git
git push -u origin main
```

### Step 2: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your `scholarstrack` repo
3. Railway will detect the project — click **Add Service** → choose the `backend` folder
4. In the backend service **Variables** tab, add:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-random-secret-here-make-it-long
   ADMIN_EMAIL=admin@scholarstrack.edu
   ADMIN_PASSWORD=Admin@ScholarsTrack2024
   FRONTEND_URL=https://YOUR-FRONTEND-URL.up.railway.app
   DATABASE_URL=./scholarstrack.db
   ```
5. In **Settings** → **Root Directory**: set to `backend`
6. In **Settings** → **Build Command**: `npm install && npm run build`
7. In **Settings** → **Start Command**: `node dist/index.js`
8. **Deploy** — note the generated URL (e.g. `https://scholarstrack-api.up.railway.app`)

### Step 3: Deploy Frontend on Railway

1. In the same Railway project, **Add Service** → select same repo
2. In **Settings** → **Root Directory**: set to `frontend`
3. In **Variables** tab, add:
   ```
   VITE_API_URL=https://scholarstrack-api.up.railway.app
   ```
4. In **Settings** → **Build Command**: `npm install && npm run build`
5. In **Settings** → **Start Command**: `npx serve dist -p $PORT`
6. **Deploy** — note the generated URL

### Step 4: Update CORS

Go back to your **backend** service variables and update:
```
FRONTEND_URL=https://YOUR-ACTUAL-FRONTEND-URL.up.railway.app
```

Then redeploy the backend.

### Step 5: Update API proxy (for production)

In `frontend/src/lib/api.ts`, the `baseURL` is `/api` which works in development via the Vite proxy. In production with separate services, update it to:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
```

---

## 📁 Project Structure

```
scholarstrack/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts        # DB init + connection
│   │   │   └── schema.ts       # Drizzle schema
│   │   ├── middleware/
│   │   │   └── auth.ts         # Session auth guards
│   │   ├── routes/
│   │   │   ├── auth.ts         # Register, login, logout
│   │   │   ├── submissions.ts  # CRUD + review pipeline
│   │   │   ├── notifications.ts
│   │   │   ├── messages.ts
│   │   │   └── admin.ts        # Admin management
│   │   └── index.ts            # Express app entry
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx
│   │   │   └── useToast.ts
│   │   ├── lib/
│   │   │   └── api.ts          # Axios API client
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Submissions.tsx
│   │   │   ├── NewSubmission.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Messages.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminStudents.tsx
│   │   │       ├── AdminSubmissions.tsx
│   │   │       ├── AdminNotifications.tsx
│   │   │       ├── AdminMessages.tsx
│   │   │       └── AdminAdmins.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

---

## 🔄 Review Flow

```
Student Submits → Department Review → Faculty Review → Postgrad Board → Final Approval
```

Each stage can: **Approve** (advances to next stage), **Request Revision**, or **Reject**.

## 📊 Scoring Weights

| Type         | Weight |
|--------------|--------|
| Proposal     | 35%    |
| Result       | 30%    |
| Presentation | 20%    |
| Publication  | 15%    |

---

## 📞 Support

For issues, open a GitHub issue or contact your system administrator.
