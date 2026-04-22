// ─── Order Routes ─────────────────────────────────────────────────────────────
// POST  /api/orders                      — create order (auth)
// GET   /api/orders/mine                 — get user's own orders (auth)
// GET   /api/orders                      — get ALL orders (admin only)
// GET   /api/orders/:id                  — single order detail (auth, own order or admin)
// PATCH /api/orders/:id/status           — update order status (admin only)

const router          = require('express').Router();
const Order           = require('../models/Order');
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ── Helper: generate short order ID ───────────────────────────────────────────
const generateOrderId = () => {
  const ts  = Date.now().toString().slice(-8).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `NRM${ts}${rnd}`;
};

// ── POST /api/orders ──────────────────────────────────────────────────────────
// Called from payment.jsx when user confirms order.
// Body: { items, subtotal, delivery, grandTotal, paymentMethod, address,
//         razorpayOrderId?, razorpayPaymentId? }
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      items, subtotal, delivery, grandTotal,
      paymentMethod, address,
      razorpayOrderId, razorpayPaymentId,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const order = await Order.create({
      userId:           req.user._id,
      orderId:          generateOrderId(),
      items,
      subtotal,
      delivery:         delivery || 0,
      grandTotal,
      paymentMethod:    paymentMethod || 'cod',
      address:          address || {},
      razorpayOrderId:  razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      status:           'Confirmed',
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/mine ──────────────────────────────────────────────────────
// Returns orders belonging to the logged-in user, newest first.
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders — Admin: ALL orders ───────────────────────────────────────
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip   = (Number(page) - 1) * Number(limit);
    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, total, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { orderId: req.params.id },
      ],
    }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Non-admins can only see their own orders
    if (req.user.role !== 'admin' && String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// ── PATCH /api/orders/:id/status — Admin Status Update ────────────────────────
// This is the core admin dashboard action.
// Body: { status: "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled", note? }
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, note } = req.body;
    const VALID = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID.join(', ')}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderId: req.params.id }] },
      {
        status,
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
            note: note || '',
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

module.exports = router;
