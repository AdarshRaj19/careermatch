# Deployment Guide for CareerMatch

## Overview
This repository has two separate parts:

- `frontend` (root): React + Vite app
- `backend` (`backend/`): Express + SQLite API

For deployment, frontend and backend should be deployed as separate services, or the backend should be hosted on a platform that can serve the API.

---

## Backend Deployment (Render)

1. In Render, create a new Web Service.
2. Choose the `backend` folder as the deployment root.
3. Build command: `npm install && npm run db:setup`
4. Start command: `npm start`
5. Add environment variables:
   - `JWT_SECRET` = `<your secret>`
   - `GEMINI_API_KEY` = `<your gemini key>`
   - `GOOGLE_CLIENT_ID` = `<your Google client id>`
   - `GOOGLE_CLIENT_SECRET` = `<your Google client secret>`
   - `ALLOWED_ORIGINS` = `https://careermatch-eight.vercel.app`

6. Confirm your backend URL works:
   - `https://<your-render-url>/api/public/internships`

---

## Frontend Deployment (Vercel)

1. In Vercel, create a new project from this repository.
2. Use the root folder for the frontend.
3. Build command: `npm install && npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_API_BASE_URL` = `https://careermatch-484q.onrender.com/api`

6. After deployment, confirm:
   - `https://careermatch-eight.vercel.app` loads the site
   - frontend API calls go to `https://careermatch-484q.onrender.com/api`

---

## Important Notes

- The frontend uses `VITE_API_BASE_URL` to know where the backend lives.
- The backend CORS config allows the frontend origin via `ALLOWED_ORIGINS`.
- If you change the frontend URL, update `ALLOWED_ORIGINS` accordingly.
- If the backend is deployed on Render and the frontend on Vercel, make sure `VITE_API_BASE_URL` points to Render’s backend URL, not `localhost`.

---

## Troubleshooting

- If signup fails on deployed sites:
  - Validate the backend URL from the browser network panel.
  - Check the backend logs on Render.
  - Ensure `JWT_SECRET` is set in Render.
  - Ensure `VITE_API_BASE_URL` is set in Vercel.
  - Ensure `ALLOWED_ORIGINS` includes the Vercel URL.
