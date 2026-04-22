// ─── Payment Routes — Razorpay Integration ────────────────────────────────────
// POST /api/payment/create-order   → Creates a Razorpay order, returns order_id
// POST /api/payment/verify         → Verifies HMAC-SHA256 signature → saves to DB

const router          = require('express').Router();
const crypto          = require('crypto');
const Razorpay        = require('razorpay');
const Order           = require('../models/Order');
const authMiddleware  = require('../middleware/authMiddleware');

// ── Razorpay client ───────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Helper: generate human-readable order ID ──────────────────────────────────
const generateOrderId = () => {
  const ts  = Date.now().toString().slice(-8).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `NRM${ts}${rnd}`;
};

// ── POST /api/payment/create-order ────────────────────────────────────────────
// Called BEFORE the Razorpay modal is opened.
// Body: { amount }   ← in RUPEES (we convert to paise here)
// Returns: { razorpayOrderId, amount, currency, keyId }
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount:   Math.round(Number(amount) * 100), // rupees → paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes: {
        platform: 'Narmavya',
        userId:   String(req.user._id),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.json({
      success:        true,
      razorpayOrderId: razorpayOrder.id,
      amount:         razorpayOrder.amount,   // in paise
      currency:       razorpayOrder.currency,
      keyId:          process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create Razorpay order' });
  }
});

// ── POST /api/payment/verify ──────────────────────────────────────────────────
// Called AFTER the Razorpay modal closes with a successful payment.
// 1. Verify HMAC-SHA256 signature (security — never skip this)
// 2. Save the order to MongoDB
// Body: {
//   razorpayOrderId, razorpayPaymentId, razorpaySignature,
//   items, subtotal, delivery, grandTotal, paymentMethod, address
// }
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      subtotal,
      delivery,
      grandTotal,
      paymentMethod,
      address,
    } = req.body;

    // ── 1. Signature verification ─────────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed — possible tamper attempt',
      });
    }

    // ── 2. Save order to MongoDB ──────────────────────────────────────────────
    const order = await Order.create({
      userId:            req.user._id,
      orderId:           generateOrderId(),
      items:             items || [],
      subtotal:          Number(subtotal),
      delivery:          Number(delivery) || 0,
      grandTotal:        Number(grandTotal),
      paymentMethod:     paymentMethod || 'razorpay',
      address:           address || {},
      razorpayOrderId,
      razorpayPaymentId,
      status:            'Confirmed',
    });

    return res.status(201).json({
      success:  true,
      orderId:  order.orderId,
      message:  'Payment verified and order placed!',
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
  }
});

// ── POST /api/payment/cod ─────────────────────────────────────────────────────
// For Cash on Delivery — skips Razorpay, creates order directly.
router.post('/cod', authMiddleware, async (req, res) => {
  try {
    const { items, subtotal, delivery, grandTotal, address } = req.body;

    const order = await Order.create({
      userId:        req.user._id,
      orderId:       generateOrderId(),
      items:         items || [],
      subtotal:      Number(subtotal),
      delivery:      Number(delivery) || 0,
      grandTotal:    Number(grandTotal),
      paymentMethod: 'cod',
      address:       address || {},
      status:        'Confirmed',
    });

    return res.status(201).json({
      success:  true,
      orderId:  order.orderId,
      message:  'COD order placed!',
    });
  } catch (err) {
    console.error('COD order error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to place COD order' });
  }
});

module.exports = router;
