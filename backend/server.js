// ─── Narmavya Backend — Vercel-compatible Express Entry Point ─────────────────
// Works in BOTH environments:
//   • Local dev  → `node server.js`  (calls app.listen)
//   • Vercel     → exports `app` as a serverless function handler
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const reviewRoutes  = require('./routes/reviews');
const paymentRoutes = require('./routes/payment');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
    : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);            // curl / Postman / mobile
    if (
      allowedOrigins.some(o => origin === o) ||
      origin.endsWith('.vercel.app')                     // any Vercel preview URL
    ) {
      return callback(null, true);
    }
    callback(new Error('CORS: origin not allowed — ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS for all routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

// ── Lazy MongoDB connection with caching ────────────────────────────────────────
// In serverless land there is no "start up then receive requests".
// Instead we connect on the first request and cache the promise so
// subsequent invocations reuse the existing connection.
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS:          45000,
};

let dbConnectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(); // already connected
  }
  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, MONGO_OPTIONS)
      .then(() => {
        console.log('✅ MongoDB Atlas connected');
      })
      .catch(err => {
        dbConnectionPromise = null; // reset so next request retries
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
      });
  }
  return dbConnectionPromise;
};

// ── DB-connect middleware (runs before every API request) ──────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again in a moment.',
    });
  }
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service:   'Narmavya API',
    status:    'running',
    db:        mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'Narmavya API',
    db:        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payment',  paymentRoutes);

// ── 404 catch-all ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Local dev: start listening ─────────────────────────────────────────────────
// On Vercel this block is NEVER reached — Vercel uses `module.exports` below.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`\n🚀 Narmavya API  →  http://localhost:${PORT}`);
        console.log(`📋 Routes: /api/auth | /api/products | /api/orders | /api/reviews | /api/payment\n`);
      });
      server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${PORT} busy — trying ${PORT + 1}`);
          app.listen(PORT + 1);
        }
      });
    })
    .catch(err => {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    });
}

// ── Vercel serverless export ───────────────────────────────────────────────────
// @vercel/node calls this as a regular HTTP handler — no listen() needed.
module.exports = app;
