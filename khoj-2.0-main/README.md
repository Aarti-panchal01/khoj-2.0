# Khoj — Lost & Found for College Campuses

A full-stack lost and found platform for college students. Post found items, report lost ones, and reunite belongings with their owners — scoped to your university.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal) ![Express](https://img.shields.io/badge/Express-4-green) ![MongoDB](https://img.shields.io/badge/MongoDB-8-green)

---

## Features

- University-scoped item feed — users only see posts from their own university
- Campus filter within a university (e.g. PES EC vs PES RR)
- Email OTP verification on signup
- JWT access tokens (1h) + HTTP-only refresh tokens (7d) with rotation
- Image uploads via Cloudinary
- Rate limiting, NoSQL injection protection, CORS, Helmet security headers
- Account lockout after failed login attempts

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcrypt, HTTP-only cookies |
| Storage | Cloudinary |
| Email | Nodemailer (SMTP) |

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier)
- SMTP credentials (Gmail App Password works)

### 1. Clone

```bash
git clone https://github.com/your-username/khoj.git
cd khoj
```

### 2. Frontend setup

```bash
npm install
cp .env.example .env.local
# .env.local: set VITE_API_URL=http://localhost:4000/api
npm run dev
```

### 3. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Fill in all values in server/.env (see below)
npm run dev
```

### Required server environment variables

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/khoj
JWT_SECRET=<random 64-char hex>
JWT_REFRESH_SECRET=<different random 64-char hex>
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM_NAME=Khoj Lost & Found
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deployment

- Frontend → Vercel (set `VITE_API_URL` env var)
- Backend → Render (set all server env vars in dashboard)
- Database → MongoDB Atlas (whitelist `0.0.0.0/0`)

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide.

---

## Universities seeded by default

| University | Campuses |
|------------|----------|
| PES University | Electronic City, Ring Road, Hanumanth Nagar |
| Dayananda Sagar University | Main Campus |
| RV College of Engineering | Main Campus |
| REVA University | Main Campus |
| UVCE | Main Campus |

To add more: insert a document into the `universities` collection. No code changes needed.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT
