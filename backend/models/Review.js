// ─── Review Model ─────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // ── Who wrote the review ──────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Cached user name to avoid N+1 joins on the product page
    userName: { type: String, default: 'Anonymous' },
    userAvatar: { type: String, default: '' },

    // ── Which product ─────────────────────────────────────────────────────────
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    // For pre-migration products that only have a numeric legacyId
    productLegacyId: { type: Number, default: null },

    // ── Content ───────────────────────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review text cannot exceed 1000 characters'],
      default: '',
    },

    // ── Moderation ────────────────────────────────────────────────────────────
    isVisible: { type: Boolean, default: true },  // admin can hide a review
  },
  {
    timestamps: true,
  }
);

// ── One review per user per product ───────────────────────────────────────────
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// ── After a review is saved/deleted, update the product's cached rating ────────
async function updateProductRating(productId) {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');

  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isVisible: true } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // round to 1 decimal
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
}

reviewSchema.post('save', function () {
  updateProductRating(this.productId);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) updateProductRating(doc.productId);
});

module.exports = mongoose.model('Review', reviewSchema);
