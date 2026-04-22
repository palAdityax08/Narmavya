// ─── Narmavya Backend — Express Server Entry Point ───────────────────────────
require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const reviewRoutes  = require('./routes/reviews');
const paymentRoutes = require('./routes/payment');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin === o || origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Narmavya API',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── Mount routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payment',  paymentRoutes);

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start listening — auto-increment port on EADDRINUSE ───────────────────────
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n🚀 Narmavya API  →  http://localhost:${port}`);
    console.log(`📋 Routes: /api/auth | /api/products | /api/orders | /api/reviews | /api/payment\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} busy — trying ${port + 1}...`);
      server.close();
      startServer(port + 1);   // try next port automatically
    } else {
      console.error('Server error:', err);
    }
  });
};

// ── Connect to MongoDB Atlas then start listening ─────────────────────────────
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,  // 10s to find a server
  socketTimeoutMS:          45000,  // 45s socket timeout
};

const connectWithRetry = (attempt = 1) => {
  console.log(`🔄 MongoDB connecting... (attempt ${attempt})`);
  mongoose
    .connect(process.env.MONGO_URI, MONGO_OPTIONS)
    .then(() => {
      console.log('✅ MongoDB Atlas connected');
      startServer(PORT);
    })
    .catch((err) => {
      console.error(`❌ MongoDB connection failed (attempt ${attempt}):`, err.message);

      // Give a clear hint about the IP whitelist issue
      if (err.message.includes('whitelist') || err.message.includes('IP') || err.message.includes('ENOTFOUND') || err.message.includes('Could not connect')) {
        console.error('\n💡 FIX: Go to MongoDB Atlas → Network Access → + ADD IP ADDRESS');
        console.error('   → Click "ALLOW ACCESS FROM ANYWHERE" → Confirm\n');
      }

      // Retry up to 3 times with exponential back-off
      if (attempt < 3) {
        const delay = attempt * 5000;
        console.log(`⏳ Retrying in ${delay / 1000}s...\n`);
        setTimeout(() => connectWithRetry(attempt + 1), delay);
      } else {
        console.error('💀 All MongoDB connection attempts failed. Exiting.\n');
        process.exit(1);
      }
    });
};

connectWithRetry();
