# DivyangConnect-AI — One-Stop Portal for Persons with Disabilities

> A React + Firebase web application that gives Persons with Disabilities (PWD)
> centralised access to government schemes, scholarships, jobs, health services,
> travel assistance, and more.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Install Dependencies](#3-install-dependencies)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Firebase Setup](#5-firebase-setup)
6. [Run the Frontend (Dev Server)](#6-run-the-frontend-dev-server)
7. [Run the Backend (Optional)](#7-run-the-backend-optional)
8. [Build for Production](#8-build-for-production)
9. [Preview the Production Build](#9-preview-the-production-build)
10. [Troubleshooting](#10-troubleshooting)
11. [Technology Stack](#11-technology-stack)
12. [Deploy](#12-deploy)

---

## 1. Prerequisites

Make sure the following tools are installed on your machine before you begin.

| Tool | Minimum version | Check with |
|------|-----------------|------------|
| [Node.js](https://nodejs.org) | **18.x** or later | `node --version` |
| [npm](https://www.npmjs.com) | **9.x** or later (comes with Node) | `npm --version` |
| [Git](https://git-scm.com) | any recent version | `git --version` |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to
> manage multiple Node.js versions side-by-side.
> ```sh
> nvm install 20
> nvm use 20
> ```

---

## 2. Clone the Repository

```sh
git clone https://github.com/adityawargade90/DivyangConnect-AI.git
cd DivyangConnect-AI
```

---

## 3. Install Dependencies

### Frontend (React / Vite)

```sh
# Run from the project root
npm install
```

### Backend (Express / Node — optional)

```sh
cd Backend
npm install
cd ..
```

---

## 4. Configure Environment Variables

The app reads secrets from a `.env` file in the **project root**.
A ready-made template is provided:

```sh
cp .env.example .env
```

Open `.env` in your editor and fill in the values (see the next section for
where to get the Firebase values):

```
# ── Firebase (required) ──────────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX   # optional

# ── Google Maps (optional — used by location-based pages) ────────────────────
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...

# ── Backend (only needed if you also run the Express server) ─────────────────
MONGO_URI=mongodb+srv://...
```

> **Security:** `.env` is listed in `.gitignore` and will never be committed.
> Never share or commit real API keys.

---

## 5. Firebase Setup

The frontend uses Firebase **Authentication** and **Firestore** as its database.
You need a Firebase project before the app can sign users in or read/write data.

### 5.1 — Create a Firebase project

1. Go to <https://console.firebase.google.com>
2. Click **Add project** and follow the wizard.
3. **Enable Email/Password sign-in:**
   - Left sidebar → **Build → Authentication → Get started**
   - Click the **Sign-in method** tab → **Email/Password** → Enable → Save.
4. **Enable Firestore:**
   - Left sidebar → **Build → Firestore Database → Create database**
   - Choose **Start in production mode** (recommended) or *test mode* for quick dev.
   - Pick your nearest region → **Enable**.

### 5.2 — Get your Firebase config

1. Firebase Console → gear icon → **Project Settings** → **General**.
2. Scroll to **Your apps** → click **Add app** → choose the Web icon (`</>`).
3. Register the app (any nickname) and copy the `firebaseConfig` object.
4. Map the values to `.env` as shown in [Step 4](#4-configure-environment-variables).

### 5.3 — Firestore security rules

In the Firebase Console → **Firestore Database → Rules**, replace the default
rules with the following and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Each user can read/write only their own profile document
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Feedback: authenticated users can submit; only server-side can read
    match /feedback/{docId} {
      allow create: if request.auth != null;
      allow read:   if false;
    }
  }
}
```

---

## 6. Run the Frontend (Dev Server)

```sh
# From the project root
npm run dev
```

The development server starts at **http://localhost:8080**.
Open that URL in your browser to see the app.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Vite dev server with hot-module reload |
| `npm run build` | Create an optimised production build in `dist/` |
| `npm run build:dev` | Production build with development-mode flags |
| `npm run preview` | Serve the `dist/` build locally for testing |
| `npm run lint` | Run ESLint across the entire codebase |

---

## 7. Run the Backend (Optional)

The Express backend (`./Backend/server.js`) exposes REST endpoints for legacy
JWT-based auth and MongoDB profile storage. It is **not required** to run the
app — the frontend now uses Firebase directly for auth and Firestore for data.

If you still want to run it (e.g. for the MongoDB endpoints):

```sh
# Create a .env inside Backend/ with:
#   MONGO_URI=mongodb+srv://...
#   JWT_SECRET=your_secret_key

cd Backend
npm run dev        # uses nodemon — auto-restarts on file changes
# or
npm start          # plain node (no auto-restart)
```

The backend listens on **http://localhost:5000**.

---

## 8. Build for Production

```sh
npm run build
```

The optimised, minified output is written to the `dist/` folder.
You can deploy this folder to any static hosting service (Vercel, Netlify,
Firebase Hosting, GitHub Pages, etc.).

---

## 9. Preview the Production Build

Run this after `npm run build` to serve the `dist/` folder and test it locally
before deploying:

```sh
npm run preview
```

Opens at **http://localhost:4173** by default.

---

## 10. Troubleshooting

### "Firebase: Error (auth/...)" on sign-in or sign-up
- Double-check that `VITE_FIREBASE_*` values in `.env` match the ones in the
  Firebase Console exactly (no trailing spaces).
- Make sure the **Email/Password** sign-in provider is enabled in
  Firebase Console → Authentication → Sign-in method.

### Port 8080 is already in use
```sh
# Kill the process using port 8080 (macOS / Linux)
kill -9 $(lsof -ti :8080)

# Or change the port temporarily
npm run dev -- --port 3000
```

### `node_modules` issues / dependency errors
```sh
rm -rf node_modules package-lock.json
npm install
```

### Environment variables are not being picked up
- Make sure the file is named exactly `.env` (not `.env.txt`) in the project
  root (same folder as `package.json`).
- All frontend variables **must** start with `VITE_` — Vite ignores any other
  prefix.
- Restart the dev server after editing `.env`.

### TypeScript or ESLint errors on startup
```sh
npm run lint        # see full ESLint output
npx tsc --noEmit    # type-check without building
```

---

## 11. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 |
| Build tool | Vite 7 |
| Language | TypeScript |
| UI components | shadcn-ui + Radix UI |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Authentication | Firebase Auth (Email/Password) |
| Maps | React Google Maps / React Leaflet |
| Backend (optional) | Express 5 + MongoDB (Mongoose) |
| State / data fetching | TanStack Query |

---

### Firebase Hosting

```sh
npm install -g firebase-tools
firebase login
firebase init hosting        # choose dist/ as public dir, SPA rewrite
npm run build
firebase deploy
```

### Vercel / Netlify

1. Connect your GitHub repository in the Vercel / Netlify dashboard.
2. Set **Build command** → `npm run build`
3. Set **Output directory** → `dist`
4. Add all `VITE_FIREBASE_*` environment variables in the hosting dashboard.
5. Deploy.

### Custom domain

Connect a custom domain via **Project → Settings → Domains** in Lovable, or
follow your hosting provider's domain setup guide.

---

