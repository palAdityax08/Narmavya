// ─── Auth Routes ──────────────────────────────────────────────────────────────
// POST /api/auth/google   — Firebase ID token → our JWT
// POST /api/auth/register — Email/password register
// POST /api/auth/login    — Email/password login
// GET  /api/auth/me       — Get current user (protected)

const router         = require('express').Router();
const jwt            = require('jsonwebtoken');
const path           = require('path');
const admin          = require('firebase-admin');
const User           = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// ── Initialize Firebase Admin SDK ONCE at module load ─────────────────────────
// Uses env vars instead of a JSON file — required for Vercel / serverless.
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (privateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log('✅ Firebase Admin SDK initialized (env vars)');
    } else {
      // Fallback: try local JSON file (only works in local dev)
      try {
        const path = require('path');
        const serviceAccount = require(path.resolve(__dirname, '../firebase-service-account.json'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log('✅ Firebase Admin SDK initialized (local JSON)');
      } catch {
        console.warn('⚠️  Firebase Admin SDK: missing env vars AND no local JSON. Google Sign-In will not work.');
      }
    }
  } catch (err) {
    console.error('⚠️  Firebase Admin SDK failed to initialize:', err.message);
  }
}


// ── Helper: sign a JWT ────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Frontend sends the Firebase ID token obtained from signInWithPopup().
// We verify it with Firebase Admin, then find/create the user in MongoDB
// and return our own JWT (so our backend fully controls session lifetime).
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseErr) {
      console.error('Firebase verifyIdToken failed:', firebaseErr.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase token — ' + firebaseErr.message,
      });
    }

    const { uid, email, name, picture } = decodedToken;

    // Find or create user in MongoDB
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (!user) {
      user = await User.create({
        name:        name || email.split('@')[0],
        email:       email.toLowerCase(),
        firebaseUid: uid,
        avatar:      picture || '',
        role:        'user',
      });
    } else {
      // Update Firebase UID / avatar if missing
      let changed = false;
      if (!user.firebaseUid)      { user.firebaseUid = uid;     changed = true; }
      if (picture && !user.avatar){ user.avatar = picture;      changed = true; }
      if (changed) await user.save();
    }

    const token = signToken(user._id);
    return res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Google sign-in failed' });
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email:        email.toLowerCase(),
      passwordHash,
    });

    const token = signToken(user._id);
    return res.status(201).json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await user.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    return res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
