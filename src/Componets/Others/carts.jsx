import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { toast } from 'react-toastify';

/* ─── Star Rating ─────────────────────────────────────────────── */
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5 stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <i key={s} className={`ri-star-${
        s <= Math.floor(rating) ? 'fill' : s - 0.5 <= rating ? 'half-fill' : 'line'
      } text-xs`} />
    ))}
  </div>
);

/* ─── Magnetic Button ─────────────────────────────────────────── */
const MagneticBtn = ({ children, onClick, className, style, disabled }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const handleLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, ...style }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      onClick={onClick} disabled={disabled} className={className}>
      {children}
    </motion.button>
  );
};

/* ─── Quick Look Modal ───────────────────────────────────────── */
const QuickLookModal = ({ product, onClose, onAddToCart }) => {
  const navigate = useNavigate();
  if (!product) return null;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(253,246,236,0.98)', backdropFilter: 'blur(20px)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-1/2 h-64 sm:h-auto relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              {product.stock <= 5 && (
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  🔥 Only {product.stock} left!
                </div>
              )}
              {discount > 0 && (
                <div className="absolute bottom-3 right-3 bg-[#E8650A] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {discount}% OFF
                </div>
              )}
            </div>
            {/* Details */}
            <div className="sm:w-1/2 p-6 flex flex-col">
              <button onClick={onClose} className="self-end text-gray-400 hover:text-gray-700 mb-3">
                <i className="ri-close-line text-xl" />
              </button>
              {product.badge && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8650A] mb-2">{product.badge}</span>
              )}
              <h3 className="font-black text-xl text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.title}
              </h3>
              {product.origin && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <i className="ri-map-pin-2-line text-[#E8650A]" /> {product.origin}
                </p>
              )}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-[#E8650A]">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-4">{product.description}</p>
              {product.artisan && (
                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                  <i className="ri-user-line" /> by {product.artisan}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { onAddToCart(product); onClose(); }}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}
                >
                  <i className="ri-shopping-bag-line" /> Add to Cart
                </button>
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#E8650A] hover:text-[#E8650A] transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Main Card Component ────────────────────────────────────── */
const Cart = ({
  id, url, title, price, originalPrice,
  rating, reviews, badge, origin, category,
  artisan, description, stock, inStock,
}) => {
  const navigate   = useNavigate();
  const [qty, setQty]               = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded]           = useState(false);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const [quickLook, setQuickLook]   = useState(false);

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlisted(wl.some((i) => i.id === id));
  }, [id]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlisted) {
      localStorage.setItem('wishlist', JSON.stringify(wl.filter((i) => i.id !== id)));
      setWishlisted(false);
      toast.info('Removed from wishlist');
    } else {
      wl.push({ id, url, title, price, originalPrice, rating, badge, origin, category });
      localStorage.setItem('wishlist', JSON.stringify(wl));
      setWishlisted(true);
      toast.success('Saved to wishlist ❤️', { icon: false });
    }
  };

  const addToCart = (product) => {
    const session = JSON.parse(sessionStorage.getItem('login'));
    if (!session?.isLoggedIn) {
      toast.info('Please login to add items to cart');
      navigate('/login', { state: { returnTo: '/addToCart' } });
      return;
    }
    const user = JSON.parse(localStorage.getItem('user')) || {};
    if (!user.products) user.products = [];
    const p = product || { id, url, title, price, originalPrice, rating, badge, origin, category, artisan, description };
    const existing = user.products.find(x => x.id === p.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty;
    } else {
      user.products.push({ id: p.id, title: p.title, price: p.price, url: p.url || p.image, quantity: qty, origin: p.origin });
    }
    localStorage.setItem('user', JSON.stringify(user));
    setAdded(true);
    toast.success(`${(p.title || title).slice(0, 28)}… added! 🛍️`);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isLowStock = stock !== undefined && stock <= 5;

  const badgeMap = {
    'GI Tagged': 'badge-gold', 'Bestseller': 'badge-saffron',
    'Organic': 'badge-forest', 'Hand-painted': 'badge-ivory', default: 'badge-ivory',
  };
  const badgeCls = badgeMap[badge] || badgeMap.default;

  const productObj = { id, image: url, url, title, price, originalPrice, badge, origin, artisan, description, stock, category };

  return (
    <>
      {quickLook && (
        <QuickLookModal
          product={productObj}
          onClose={() => setQuickLook(false)}
          onAddToCart={() => addToCart(null)}
        />
      )}

      <motion.article
        className="product-card-editorial flex flex-col w-full sm:w-[280px] flex-shrink-0 group"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── IMAGE AREA ───────────────────────────────── */}
        <div
          className="relative h-64 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/product/${id}`)}
        >
          {!imgLoaded && <div className="absolute inset-0 shimmer-bg" />}
          <img
            src={url}
            alt={title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Gradient veil */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {badge && <span className={`badge ${badgeCls}`}>{badge}</span>}
            {discount > 0 && <span className="badge badge-saffron">{discount}% off</span>}
            {isLowStock && (
              <span className="badge bg-rose-500 text-white border-0 text-[9px] font-bold">
                🔥 Only {stock} left
              </span>
            )}
          </div>

          {/* Wishlist */}
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <i className={`ri-heart-${wishlisted ? 'fill text-rose-500' : 'line text-gray-500'} text-base`} />
          </motion.button>

          {/* Quick Look hover pill */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 z-10 px-4 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { e.stopPropagation(); setQuickLook(true); }}
          >
            <i className="ri-eye-line" /> Quick Look
          </motion.button>
        </div>

        {/* ── CONTENT AREA ─────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-5">
          {origin && (
            <div className="flex items-center gap-1 mb-2">
              <i className="ri-map-pin-2-line text-[10px]" style={{ color: '#E8650A' }} />
              <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">{origin}</span>
            </div>
          )}
          <h3 className="font-semibold text-gray-900 text-[0.92rem] leading-snug mb-2 line-clamp-2 font-display">{title}</h3>
          {artisan && (
            <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
              <i className="ri-user-line" /> by {artisan}
            </p>
          )}
          {rating && (
            <div className="flex items-center gap-1.5 mb-3">
              <StarRating rating={rating} />
              <span className="text-[10px] text-gray-400">({reviews})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-black" style={{ color: '#E8650A' }}>₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium">−</button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(stock || 10, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium">+</button>
            </div>
            <MagneticBtn
              onClick={() => addToCart(null)}
              className={`flex-1 h-9 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-300 ${added ? 'scale-95' : ''}`}
              style={{ background: added ? 'linear-gradient(135deg, #1B6B3A, #0F4A27)' : 'linear-gradient(135deg, #E8650A, #C4500A)' }}
            >
              {added ? <><i className="ri-check-line" /> Added!</> : <><i className="ri-shopping-bag-line" /> Add</>}
            </MagneticBtn>
          </div>
        </div>
      </motion.article>
    </>
  );
};

export default Cart;