// ─── Product Model ────────────────────────────────────────────────────────────
// Mirrors the shape of mpProducts.js, with key upgrades:
//   • images: [String]  — supports multiple product photos
//   • image: String     — kept as images[0] alias for backward compat
//   • createdBy: ObjectId — tracks which admin uploaded the product
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // ── Core fields ──────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    titleHi: { type: String, default: '' }, // Hindi title

    // ── Category ─────────────────────────────────────────────────────────────
    category: {
      type: String,
      required: true,
      enum: [
        'silk-textiles', 'handloom-clothing', 'carpets-rugs',
        'handicrafts', 'tribal-art', 'stone-craft', 'leather-craft',
        'bamboo-cane', 'jewelry', 'organic-spices', 'organic-food', 'home-decor',
      ],
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least ₹1'],
    },
    originalPrice: { type: Number, default: null },

    // ── Images — PRIMARY FIELD ────────────────────────────────────────────────
    // Supports multiple product images (Phase 1 upgrade)
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A product can have at most 10 images',
      },
    },
    // Backward-compat alias — always the first image in images[]
    // This is a virtual, not stored separately
    image: {
      type: String,
      default: '',
    },

    // ── Product details ──────────────────────────────────────────────────────
    description: { type: String, default: '' },
    badge: { type: String, default: '' },         // e.g. "GI Tagged", "Bestseller"
    origin: { type: String, default: '' },         // e.g. "Chanderi, Ashoknagar"
    artisan: { type: String, default: '' },

    // ── Ratings (computed from reviews, cached here for fast reads) ──────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // ── Inventory ─────────────────────────────────────────────────────────────
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: null },       // null = "unlimited / not tracked"

    // ── GI Tag flag (for advanced filtering) ─────────────────────────────────
    isGiTagged: { type: Boolean, default: false },

    // ── Admin tracking ────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Legacy numeric ID (from mpProducts.js, used during seed migration) ────
    legacyId: { type: Number, default: null, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Pre-save: keep image in sync as images[0] ──────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    this.image = this.images[0];
  } else if (this.image && this.images.length === 0) {
    this.images = [this.image];
  }
  // Auto-detect GI Tagged badge
  if (this.badge && this.badge.toLowerCase().includes('gi')) {
    this.isGiTagged = true;
  }
  next();
});

// ── Indexes for fast filtering ─────────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isGiTagged: 1 });
productSchema.index({ inStock: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ title: 'text', description: 'text' }); // full-text search

module.exports = mongoose.model('Product', productSchema);
