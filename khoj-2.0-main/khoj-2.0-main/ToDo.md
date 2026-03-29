# ToDo – Environment Setup & Required Keys

Use this checklist to gather every URL, token, and configuration value needed for the new backend+frontend stack.

## 1. Backend (.env inside `server/`)

| Key | Purpose | How to get it |
| --- | --- | --- |
| `PORT` | Local port for Express API | Pick an open port (default `4000`). No external signup needed. |
| `MONGODB_URI` | Connection string for MongoDB Atlas | 1) Create a free Atlas cluster 2) Add your IP to Network Access 3) Create a database user + password 4) Copy the `mongodb+srv://...` URI and paste here. |
| `JWT_SECRET` | Secret to sign auth tokens | Generate a strong random string (e.g., `openssl rand -base64 32` or `npx nanoid`). Keep it private. |
| `CLIENT_ORIGIN` | Allowed frontend origin(s) for CORS | Use `http://localhost:5173` for local dev. In production, list your deployed frontend URL(s) separated by commas. |

Steps:
1. Copy `server/.env.example` to `server/.env`.
2. Fill values:
   ```env
   PORT=4000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/khoj
   JWT_SECRET=<32+ character random string>
   CLIENT_ORIGIN=http://localhost:5173
   ```
3. Start the API: `npm run server`.
4. For production: use your hosted Mongo URI and replace `CLIENT_ORIGIN` with your deployed frontend origin(s).

## 2. Frontend (.env at project root)

| Key | Purpose | How to get it |
| --- | --- | --- |
| `VITE_API_URL` | Base URL for the backend API | Point to the Express server (local: `http://localhost:4000/api`, production: your deployed API URL). |

Steps:
1. Copy `.env.example` to `.env`.
2. Fill values:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```
3. For production, swap this to `https://your-api-domain.com/api`.
4. Restart `npm run dev` so Vite picks up new env values.

## 3. Optional / Future Integrations

| Key | Needed for | How to obtain |
| --- | --- | --- |
| `CLOUDINARY_URL` or `S3` keys | Real image uploads | Sign up for Cloudinary or AWS S3, create credentials, store the URL/keys in the backend `.env`, and update upload logic. |
| Email provider API key (SendGrid, Mailgun, etc.) | Verification / notifications | Create an account with a transactional email provider, generate an API key, and store it in the backend `.env` as e.g. `EMAIL_API_KEY`. |

> Keep all `.env` files out of version control. For production, store secrets in your hosting platform’s secret manager (Vercel, Render, AWS, etc.).
