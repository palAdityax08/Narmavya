import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate }    from 'react-router-dom';
import { motion, AnimatePresence }    from 'framer-motion';
import { toast, ToastContainer }     from 'react-toastify';
import Nav                           from '../nav';
import Footer                        from './Footer';
import { mpProducts }                from '../../data/mpProducts';
import useCartStore                  from '../../store/cartStore';
import useWishlistStore              from '../../store/wishlistStore';
import useAuthStore                  from '../../store/authStore';
import api                           from '../../utils/api';


// ─────────────────────────────────────────────────────────────────────────────
// STAR RATING INPUT
// ─────────────────────────────────────────────────────────────────────────────
const StarInput = ({ value, onChange, size = 28 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
          style={{ fontSize: size }}>
          {star <= (hover || value)
            ? <span style={{ color: '#D4A017' }}>★</span>
            : <span style={{ color: '#d1d5db' }}>★</span>}
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-gray-500">
          {['','Poor','Fair','Good','Great','Excellent'][value]}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RATING BREAKDOWN BARS
// ─────────────────────────────────────────────────────────────────────────────
const RatingBreakdown = ({ reviews }) => {
  const counts = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => Math.round(r.rating) === s).length,
  }));
  const total = reviews.length || 1;
  const avg   = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="flex gap-6 items-center flex-wrap">
      {/* Big rating number */}
      <div className="text-center">
        <p className="text-6xl font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>{avg}</p>
        <div className="flex justify-center gap-0.5 my-1">
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ color: s <= Math.round(avg) ? '#D4A017' : '#e5e7eb', fontSize: 18 }}>★</span>
          ))}
        </div>
        <p className="text-xs text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Bars */}
      <div className="flex-1 min-w-[160px] space-y-2">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-4 text-right">{star}</span>
            <span style={{ color:'#D4A017', fontSize:12 }}>★</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / total) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#D4A017,#E8650A)' }}
              />
            </div>
            <span className="text-gray-400 w-4">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE REVIEW CARD
// ─────────────────────────────────────────────────────────────────────────────
const ReviewCard = ({ review, onDelete, canDelete }) => {
  const initials = (review.userId?.name || review.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const date     = new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-md"
          style={{ background:'linear-gradient(135deg,#E8650A,#1B6B3A)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{review.userId?.name || review.name || 'Verified Buyer'}</p>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          {/* Stars */}
          <div className="flex gap-0.5 my-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: s <= review.rating ? '#D4A017' : '#e5e7eb', fontSize:14 }}>★</span>
            ))}
          </div>
          {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
          <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
        </div>
        {canDelete && (
          <button onClick={onDelete}
            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
            <i className="ri-delete-bin-line text-sm" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const ReviewsSection = ({ productId, productName }) => {
  const { user, isLoggedIn, isAdmin } = useAuthStore();
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating,  setRating]  = useState(0);
  const [title,   setTitle]   = useState('');
  const [text,    setText]    = useState('');

  // ── Load reviews ────────────────────────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(data.reviews || []);
    } catch {
      // Offline: load from localStorage
      const stored = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
      setReviews(stored);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  // ── Submit review ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) { toast.warn('Please log in to leave a review'); return; }
    if (rating === 0)  { toast.error('Please select a star rating');    return; }
    if (!text.trim())  { toast.error('Please write your review');        return; }

    setSubmitting(true);
    const localReview = {
      _id: Date.now().toString(), rating, title, text,
      name: user?.name || 'You',
      createdAt: new Date().toISOString(),
    };

    try {
      const { data } = await api.post(`/reviews/${productId}`, { rating, title, text });
      setReviews(prev => [data.review, ...prev]);
      toast.success('Review posted! Thank you 🌿');
    } catch {
      // Offline fallback: save to localStorage
      const stored = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
      const updated = [localReview, ...stored];
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(updated));
      setReviews(updated);
      toast.success('Review saved locally (backend offline)');
    } finally {
      setRating(0); setTitle(''); setText('');
      setShowForm(false);
      setSubmitting(false);
    }
  };

  // ── Delete review ───────────────────────────────────────────────────────────
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch {
      const stored = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
      const updated = stored.filter(r => r._id !== reviewId);
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(updated));
      setReviews(updated);
    }
  };

  const userHasReviewed = reviews.some(r => r.userId?._id === user?._id || r.userId === user?._id);

  return (
    <section className="bg-white border-t border-gray-100 py-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-1">Customer Reviews</p>
              <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
                What People Say
              </h2>
            </div>
            {isLoggedIn() && !userHasReviewed && (
              <motion.button whileHover={{ y:-1 }} whileTap={{ scale:0.98 }}
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm shadow-md hover:shadow-lg transition-all"
                style={{ background:'linear-gradient(135deg,#E8650A,#C4500A)' }}>
                <i className="ri-edit-line" />
                {showForm ? 'Cancel' : 'Write a Review'}
              </motion.button>
            )}
          </div>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
              <RatingBreakdown reviews={reviews} />
            </div>
          )}

          {/* Write review form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                exit={{ opacity:0, height:0 }}
                className="overflow-hidden mb-8"
              >
                <form onSubmit={handleSubmit}
                  className="bg-gradient-to-br from-orange-50 to-amber-50/40 border border-orange-200/50 rounded-3xl p-7 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Rating *</p>
                    <StarInput value={rating} onChange={setRating} size={32} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Review Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      maxLength={80} placeholder="Summarise your experience…"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-colors bg-white" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Your Review *</label>
                    <textarea value={text} onChange={e => setText(e.target.value)}
                      rows={4} maxLength={1000} required
                      placeholder={`Tell others about ${productName}…`}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm resize-none transition-colors bg-white" />
                    <p className="text-xs text-gray-400 mt-1 text-right">{text.length}/1000</p>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all"
                    style={{ background: submitting ? '#aaa' : 'linear-gradient(135deg,#E8650A,#C4500A)', boxShadow: submitting ? 'none' : '0 8px 25px rgba(232,101,10,0.3)' }}>
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting…</>
                      : <><i className="ri-send-plane-fill" />Post Review</>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews list */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full shimmer-bg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 shimmer-bg rounded" />
                      <div className="h-3 w-1/4 shimmer-bg rounded" />
                      <div className="h-3 w-full shimmer-bg rounded" />
                      <div className="h-3 w-2/3 shimmer-bg rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-5xl mb-4">💬</p>
              <p className="font-bold text-gray-700 mb-1">No reviews yet</p>
              <p className="text-gray-400 text-sm">
                {isLoggedIn()
                  ? 'Be the first to share your experience!'
                  : 'Log in to be the first to review this product'}
              </p>
              {!isLoggedIn() && (
                <a href="/login" className="inline-block mt-4 text-[#E8650A] font-semibold text-sm hover:underline">
                  Log in to Review →
                </a>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <ReviewCard key={r._id} review={r}
                  canDelete={isAdmin() || r.userId?._id === user?._id || r.userId === user?._id}
                  onDelete={() => handleDelete(r._id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PRODUCT INFO COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [view3D, setView3D] = useState(false);
  const [qty, setQty] = useState(1);

  // ── Zustand stores ──────────────────────────────────────────────
  const { addItem, isInCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();

  useEffect(() => {
    const foundProduct = mpProducts.find((p) => p.id === Number(id));
    if (foundProduct) setProduct(foundProduct);
  }, [id]);

  const addToCart = () => {
    // Check authStore token (Google login) OR legacy sessionStorage
    const hasToken  = !!useAuthStore.getState().token;
    const hasSession = !!JSON.parse(sessionStorage.getItem('login') || '{}')?.isLoggedIn;
    if (!hasToken && !hasSession) {
      toast.warn('Please log in to add items to cart!');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (product.inStock === false) {
      toast.error('This product is currently out of stock');
      return;
    }
    addItem(product, qty);
    toast.success('Added to your artisanal cart! 🛍️');
  };

  const toggleWishlist = () => {
    const wasAdded = toggleItem(product);
    toast(wasAdded ? 'Saved to wishlist! ❤️' : 'Removed from wishlist', {
      type: wasAdded ? 'success' : 'info',
    });
  };

  const wishlisted    = product ? isWishlisted(product.id) : false;
  const alreadyInCart = product ? isInCart(product.id)    : false;

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8650A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDhokra = product.category === 'handicrafts' && product.title.includes('Dhokra');

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white flex flex-col">
      <Nav />

      <main className="flex-grow pt-20 sm:pt-24 pb-20 lg:pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-8 text-gray-400 text-xs">
            <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => navigate('/')}>Home</span>
            <i className="ri-arrow-right-s-line" />
            <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => navigate(`/products/${product.category}`)}>Products</span>
            <i className="ri-arrow-right-s-line" />
            <span className="text-gray-900">{product.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">

            {/* Media Gallery */}
            <div className="w-full lg:w-[55%]">
              <div className="sticky top-32">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-gray-100 aspect-[4/5] md:aspect-square flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {view3D ? (
                      <motion.div key="3d"
                        initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                        className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                        <div className="text-gray-400 mb-4 animate-pulse"><i className="ri-3d-model-line text-6xl" /></div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center px-4">
                          Interactive 3D View <br /><span className="font-light text-xs lowercase mt-2 block">(Drag to rotate)</span>
                        </p>
                        <div className="absolute inset-0 border-[4px] border-dashed border-gray-200/50 rounded-[2.5rem] pointer-events-none m-4" />
                      </motion.div>
                    ) : (
                      <motion.img key="2d"
                        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        transition={{ duration:0.5 }}
                        src={product.image} alt={product.title}
                        className="w-full h-full object-cover" />
                    )}
                  </AnimatePresence>
                  {product.badge && !view3D && (
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/40 text-xs font-bold uppercase tracking-wider shadow-sm z-10"
                      style={{ color:'#E8650A' }}>
                      {product.badge}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-6 justify-center">
                  <button onClick={() => setView3D(false)}
                    className={`flex flex-col items-center gap-2 transition-opacity ${!view3D ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                    <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${!view3D ? 'border-[#E8650A]' : 'border-transparent'}`}>
                      <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Image</span>
                  </button>
                  {isDhokra && (
                    <button onClick={() => setView3D(true)}
                      className={`flex flex-col items-center gap-2 transition-opacity ${view3D ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-white shadow-sm border-2 ${view3D ? 'border-[#E8650A]' : 'border-gray-100'}`}>
                        <i className="ri-box-3-line text-2xl text-gray-400" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">3D View</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="w-full lg:w-[45%] lg:py-10">
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
                <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-3">{product.origin}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-gray-900 leading-[1.1] mb-5">{product.title}</h1>

                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-bold" style={{ color:'#E8650A' }}>₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold ml-auto border border-green-200">
                    <i className="ri-star-fill text-[#D4A017]" />
                    {product.rating} ({product.reviews})
                  </div>
                </div>

                <p className="text-gray-600 text-base leading-relaxed mb-10 font-light">{product.description}</p>

                <div className="h-px w-full bg-gray-200/50 mb-10" />

                {/* Artisan Story */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl font-display text-gray-400">
                      {product.artisan?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Crafted By</p>
                      <p className="font-bold text-gray-900 text-lg">{product.artisan}</p>
                      <p className="text-xs text-[#E8650A] font-medium"><i className="ri-award-line mr-1" />Master Artisan</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector — hidden when out of stock */}
                {product.inStock !== false ? (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-semibold text-gray-700">Quantity</span>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setQty(q => Math.max(1, q-1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xl font-medium">−</button>
                      <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.stock || 10, q+1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xl font-medium">+</button>
                    </div>
                    {/* Only show urgency warning (≤5 left) — never show exact count to users */}
                    {product.stock && product.stock > 0 && product.stock <= 5 && (
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">Only a few left!</span>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-bold">
                      <i className="ri-close-circle-line" /> Out of Stock
                    </span>
                    <p className="text-xs text-gray-400 mt-2">This item is currently unavailable. Check back soon.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <button
                    onClick={addToCart}
                    disabled={product.inStock === false}
                    className={`flex-1 py-5 rounded-[1.5rem] font-bold text-white text-base transition-all duration-300 ${
                      product.inStock === false
                        ? 'opacity-50 cursor-not-allowed bg-gray-400'
                        : 'hover:-translate-y-1 shadow-[0_10px_30px_rgba(232,101,10,0.3)] hover:shadow-[0_15px_40px_rgba(232,101,10,0.4)]'
                    }`}
                    style={product.inStock !== false ? { background: alreadyInCart ? 'linear-gradient(135deg,#1B6B3A,#0F4A27)' : 'linear-gradient(135deg,#E8650A,#C4500A)' } : {}}
                  >
                    {product.inStock === false
                      ? 'Out of Stock'
                      : alreadyInCart
                        ? '✓ In Cart — Add More'
                        : `Add to Cart — ₹${product.price.toLocaleString()}`
                    }
                  </button>
                  <button onClick={toggleWishlist}
                    className="w-full sm:w-[72px] h-[72px] rounded-[1.5rem] flex items-center justify-center bg-white border border-gray-200 hover:border-[#E8650A] text-2xl transition-colors shadow-sm"
                    style={{ color: wishlisted ? '#f43f5e' : undefined }}>
                    <i className={wishlisted ? 'ri-heart-fill' : 'ri-heart-line'} />
                  </button>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  {[
                    ['ri-truck-line',        'Free Delivery ₹499'],
                    ['ri-shield-check-line', 'GI Authenticated'],
                    ['ri-hand-heart-line',   'Fair Trade Certified'],
                    ['ri-leaf-line',         '100% Organic Dyes'],
                  ].map(([icon, label]) => (
                    <div key={label} className="flex items-center gap-2 text-gray-600">
                      <i className={`${icon} text-[#1B6B3A] text-xl`} />
                      <span className="font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE STICKY ADD-TO-CART BAR (only on < lg screens) ── */}
      {product.inStock !== false && (
        <div className="mobile-sticky-cta">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium leading-tight truncate">{product.title}</p>
            <p className="text-[#E8650A] font-black text-base">₹{product.price.toLocaleString()}</p>
          </div>
          <button
            onClick={addToCart}
            className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all shadow-lg"
            style={{ background: alreadyInCart ? 'linear-gradient(135deg,#1B6B3A,#0F4A27)' : 'linear-gradient(135deg,#E8650A,#C4500A)', boxShadow: '0 8px 25px rgba(232,101,10,0.35)' }}
          >
            {alreadyInCart ? '✓ In Cart' : '+ Add to Cart'}
          </button>
          <button
            onClick={toggleWishlist}
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-xl"
            style={{ color: wishlisted ? '#f43f5e' : '#9ca3af' }}
          >
            <i className={wishlisted ? 'ri-heart-fill' : 'ri-heart-line'} />
          </button>
        </div>
      )}

      {/* ── REVIEWS SECTION ─────────────────────────────────────────── */}
      <ReviewsSection productId={id} productName={product.title} />

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={2500} />
    </div>
  );
};

export default ProductInfo;

