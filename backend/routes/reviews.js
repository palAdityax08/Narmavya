// ─── Review Routes ────────────────────────────────────────────────────────────
// GET    /api/reviews/:productId         — public: get all reviews for a product
// POST   /api/reviews/:productId         — auth: submit a review
// DELETE /api/reviews/:reviewId          — auth: delete own review / admin delete any

const router          = require('express').Router();
const Review          = require('../models/Review');
const Product         = require('../models/Product');
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ── GET /api/reviews/:productId ───────────────────────────────────────────────
// Returns paginated visible reviews for one product.
// Supports both MongoDB ObjectId and legacy numeric product id.
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    let productFilter;
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      productFilter = { productId };
    } else if (!isNaN(productId)) {
      productFilter = { productLegacyId: Number(productId) };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Review.countDocuments({ ...productFilter, isVisible: true });

    const reviews = await Review.find({ ...productFilter, isVisible: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('userName userAvatar rating text createdAt')
      .lean();

    // Compute average rating from DB directly
    const stats = await Review.aggregate([
      { $match: { ...productFilter, isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avgRating   = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
    const reviewCount = stats.length > 0 ? stats[0].count : 0;

    res.json({ success: true, reviews, total, avgRating, reviewCount, page: Number(page) });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// ── POST /api/reviews/:productId ──────────────────────────────────────────────
// Authenticated users submit a review (1 per product enforced by DB index).
router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Resolve product ref
    let productRef  = null;
    let legacyId    = null;

    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      const p = await Product.findById(productId);
      if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
      productRef = p._id;
    } else if (!isNaN(productId)) {
      legacyId = Number(productId);
      const p  = await Product.findOne({ legacyId });
      if (p) productRef = p._id;
    }

    if (!productRef) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      userId:          req.user._id,
      userName:        req.user.name || 'Anonymous',
      userAvatar:      req.user.avatar || '',
      productId:       productRef,
      productLegacyId: legacyId,
      rating:          Number(rating),
      text:            text?.trim() || '',
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key — user already reviewed this product
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }
    console.error('Submit review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

// ── DELETE /api/reviews/:reviewId — delete own or admin delete any ────────────
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only the author or an admin can delete
    if (String(review.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    // Post-delete hook on the model recalculates product rating automatically

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

// ── PATCH /api/reviews/:reviewId/visibility — Admin toggle visibility ──────────
router.patch('/:reviewId/visibility', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isVisible } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isVisible },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update visibility' });
  }
});

module.exports = router;
