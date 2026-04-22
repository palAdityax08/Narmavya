// ─── Product Routes ───────────────────────────────────────────────────────────
// GET    /api/products              — list with filters (public)
// GET    /api/products/:id          — single product (public)
// POST   /api/products              — create (admin only)
// PUT    /api/products/:id          — update (admin only)
// DELETE /api/products/:id          — delete (admin only)

const router         = require('express').Router();
const Product        = require('../models/Product');
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ── GET /api/products ─────────────────────────────────────────────────────────
// Supports query params: category, minPrice, maxPrice, giTag, inStock, sort, q, page, limit
router.get('/', async (req, res) => {
  try {
    const {
      category, minPrice, maxPrice,
      giTag, inStock,
      sort = 'newest',
      q,            // full-text search
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (category)           filter.category = category;
    if (giTag === 'true')   filter.isGiTagged = true;
    if (inStock === 'true') filter.inStock = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Full-text search on title + description (requires the text index)
    if (q) {
      filter.$text = { $search: q };
    }

    // ── Sort options ────────────────────────────────────────────────────────
    const sortMap = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt: 1 },
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      rating:       { rating: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    // Support both MongoDB ObjectId and legacy numeric id
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).lean();
    } else if (!isNaN(id)) {
      product = await Product.findOne({ legacyId: Number(id) }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// ── POST /api/products — Admin Create ─────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/products/:id — Admin Update ──────────────────────────────────────
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/products/:id — Admin Delete ───────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
