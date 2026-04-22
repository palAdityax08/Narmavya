// ─── Order Model ──────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// ── Embedded item snapshot (copied at order time, so product edits don't break orders)
const orderItemSchema = new mongoose.Schema(
  {
    productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    legacyId:   { type: Number, default: null }, // fallback for pre-DB products
    title:      { type: String, required: true },
    price:      { type: Number, required: true },
    quantity:   { type: Number, required: true, min: 1 },
    url:        { type: String, default: '' },   // image URL at time of order
    origin:     { type: String, default: '' },
  },
  { _id: false }
);

// ── Embedded delivery address snapshot ────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    name:    { type: String, default: '' },
    phone:   { type: String, default: '' },
    line1:   { type: String, default: '' },
    line2:   { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Who placed the order ──────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Human-readable order ID (e.g. "NRM20260421") ─────────────────────────
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    // ── Items snapshot ────────────────────────────────────────────────────────
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    subtotal:    { type: Number, required: true },
    delivery:    { type: Number, default: 0 },
    grandTotal:  { type: Number, required: true },

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'cod', 'razorpay'],
      default: 'cod',
    },
    // Razorpay IDs (populated after real payment)
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    // ── Delivery address ──────────────────────────────────────────────────────
    address: { type: addressSchema, default: () => ({}) },

    // ── Order status — THIS is what the admin dashboard changes ──────────────
    // When admin updates this, the user's /orders page reflects it live
    status: {
      type: String,
      enum: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Confirmed',
      index: true,
    },

    // ── Status change log (for order timeline on detail page) ─────────────────
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String, default: '' },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Pre-save: push initial status to history ───────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory = [{ status: this.status, changedAt: new Date() }];
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
