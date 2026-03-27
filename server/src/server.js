const dotenv = require('dotenv');
dotenv.config();

// ─── Required env validation — fail fast before anything else loads ───────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_ORIGIN'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error('Create a .env file in the server directory. See .env.example for reference.');
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === 'production';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const seedUniversities = require('./utils/seedUniversities');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const universityRoutes = require('./routes/universityRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const claimRoutes = require('./routes/claimRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.set('trust proxy', 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (curl, Postman) only in dev
      if (!origin) {
        return IS_PROD
          ? callback(new Error('Origin required in production'))
          : callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

app.use(compression());

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use(mongoSanitize());
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (IS_PROD) {
  morgan.token('url-no-query', (req) => req.path);
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url-no-query HTTP/:http-version" :status :res[content-length]'));
} else {
  app.use(morgan('dev'));
}

// ─── Rate limiters ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many posts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// ─── Base API route ───────────────────────────────────────────────────────────
app.get('/api', (_req, res) => {
  res.json({ success: true, message: 'Khoj API is running' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/items', postLimiter);
app.use('/api/items', searchLimiter);
app.use('/api/items', itemRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message: IS_PROD && statusCode === 500 ? 'Internal Server Error' : message,
    ...((!IS_PROD) && { stack: err.stack }),
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 4000;

connectDB()
  .then(seedUniversities)
  .then(() => {
    app.listen(port, () => {
      console.log('─────────────────────────────────────');
      console.log(`✅ Server running on port ${port}`);
      console.log(`   NODE_ENV     : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   CLIENT_ORIGIN: ${process.env.CLIENT_ORIGIN}`);
      console.log(`   MongoDB      : connected`);
      console.log('─────────────────────────────────────');
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
