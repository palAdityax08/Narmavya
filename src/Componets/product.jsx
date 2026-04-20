import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Nav from './nav';
import Footer from './Others/Footer';
import Cart from './Others/carts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mpProducts, mpCategories } from '../data/mpProducts';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: 'default',    label: 'Recommended' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'newest',     label: 'Newest First' },
];

const ALL_CAT = { id: 'all', label: 'All Products', icon: '🏛️', color: 'from-gray-600 to-gray-800' };

/* ═══════════════════════════════════════════════════════════════
   FRAMER VARIANTS
═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -16, scale: 0.95, transition: { duration: 0.3 } },
};

/* ═══════════════════════════════════════════════════════════════
   SMALL UTILITIES
═══════════════════════════════════════════════════════════════ */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const ResultCount = ({ n, category }) => (
  <p className="text-gray-500 text-sm">
    Showing <span className="font-bold text-gray-900">{n}</span> products
    {category !== 'all' && (
      <> in <span className="font-bold" style={{ color: '#E8650A' }}>{category}</span></>
    )}
  </p>
);

/* ═══════════════════════════════════════════════════════════════
   SHIMMER SKELETON CARD
═══════════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="rounded-[20px] overflow-hidden w-full sm:w-[280px] border border-gray-100 flex flex-col">
    <div className="h-64 shimmer-bg" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-2/3 shimmer-bg rounded" />
      <div className="h-4 w-full shimmer-bg rounded" />
      <div className="h-4 w-3/4 shimmer-bg rounded" />
      <div className="h-6 w-1/2 shimmer-bg rounded mt-2" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ onClear }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full flex flex-col items-center justify-center py-32 text-center"
  >
    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 text-5xl"
      style={{ background: 'rgba(232,101,10,0.08)' }}>
      🔍
    </div>
    <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">Nothing found</h3>
    <p className="text-gray-400 text-sm mb-8 max-w-xs">
      Try a different search term, adjust your price range, or browse all categories.
    </p>
    <button onClick={onClear} className="btn-primary text-sm px-8 py-3">
      Clear All Filters
    </button>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   PRODUCT PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
const ProductPage = () => {
  const { category }   = useParams();
  const location       = useLocation();
  const navigate       = useNavigate();

  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [searchQ,  setSearchQ]  = useState('');
  const [sortBy,   setSortBy]   = useState('default');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* URL search param sync */
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchQ(q);
  }, [location.search]);

  useEffect(() => {
    if (category) setActiveCategory(category);
    else setActiveCategory('all');
  }, [category]);

  /* Filter & sort engine */
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let result = [...mpProducts];
      if (activeCategory !== 'all') result = result.filter((p) => p.category === activeCategory);
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        result = result.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.artisan?.toLowerCase().includes(q)
        );
      }
      result = result.filter((p) => p.price <= maxPrice);
      if (sortBy === 'price-asc')  result.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
      if (sortBy === 'rating')     result.sort((a, b) => b.rating - a.rating);
      if (sortBy === 'newest')     result.reverse();
      setFiltered(result);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQ, maxPrice, sortBy]);

  const handleCategory = (id) => {
    setActiveCategory(id);
    navigate(id === 'all' ? '/products' : `/products/${id}`, { replace: true });
  };

  const clearAll = () => {
    setSearchQ('');
    setActiveCategory('all');
    setMaxPrice(100000);
    setSortBy('default');
    navigate('/products');
  };

  const hasActiveFilters = searchQ || activeCategory !== 'all' || maxPrice < 100000 || sortBy !== 'default';

  /* Parallax header */
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const headerImgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Active category label */
  const activeCatLabel = activeCategory === 'all'
    ? 'MP Marketplace'
    : mpCategories.find((c) => c.id === activeCategory)?.label || activeCategory;

  return (
    <div className="min-h-screen gond-texture">
      <Nav />

      {/* ═══════════════════════════════════════════════════════════
          IMMERSIVE PAGE HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        className="relative overflow-hidden flex items-end"
        style={{ paddingTop: '96px', minHeight: '340px' }}
      >
        {/* Background parallax */}
        <motion.div className="absolute inset-0 z-0" style={{ y: headerImgY }}>
          <img
            src="https://indiacinehub.gov.in/sites/default/files/styles/flexslider_full/public/2024-02/a2e65750d845c41f2f26279be1d7565b.jpg?itok=gOKzctW-"
            alt="MP Marketplace"
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>
        {/* Veil */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(135deg, rgba(62,27,0,0.9) 0%, rgba(27,107,58,0.7) 100%)' }}
        />
        {/* Bagh stripe */}
        <div className="absolute inset-0 z-10 bagh-stripe opacity-15 pointer-events-none" />

        <motion.div
          className="relative z-20 section-container w-full pb-12"
          style={{ opacity: headerOpacity }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-white/40 text-xs">
            <span className="cursor-pointer hover:text-white/70 transition-colors" onClick={() => navigate('/')}>Home</span>
            <i className="ri-arrow-right-s-line" />
            {activeCategory !== 'all' && (
              <>
                <span className="cursor-pointer hover:text-white/70 transition-colors" onClick={() => handleCategory('all')}>Products</span>
                <i className="ri-arrow-right-s-line" />
              </>
            )}
            <span className="text-white/70">{activeCatLabel}</span>
          </div>

          <div className="label-overline text-white/40 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            MP Marketplace
          </div>
          <h1 className="font-display font-black text-white leading-none mb-3"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}>
            {activeCatLabel}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-white/50 text-sm">
              <span className="font-bold text-white">{filtered.length || mpProducts.length}</span> authentic MP products
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-all"
              >
                <i className="ri-close-line" /> Clear filters
              </button>
            )}
          </div>
        </motion.div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          STICKY FILTER BAR
      ═══════════════════════════════════════════════════════════ */}
      <div
        className="sticky top-[85px] z-30 border-b shadow-sm"
        style={{ background: 'rgba(253,246,236,0.95)', backdropFilter: 'blur(20px)', borderColor: 'rgba(232,101,10,0.1)' }}
      >
        <div className="section-container">
          <div className="flex items-center gap-3 py-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products, artisans, districts…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-white focus:border-[#E8650A] outline-none text-sm transition-all shadow-sm"
              />
              <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQ && (
                <button
                  onClick={() => setSearchQ('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line" />
                </button>
              )}
            </div>

            {/* Sort selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-white text-sm outline-none cursor-pointer shadow-sm focus:border-[#E8650A] appearance-none font-medium text-gray-700 transition-all"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <i className="ri-sort-desc absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Price range */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 shadow-sm border-2 border-transparent focus-within:border-[#E8650A] transition-all min-w-[180px]">
              <i className="ri-price-tag-3-line text-gray-400 flex-shrink-0" />
              <div className="flex flex-col flex-2 min-w-0">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Max Price</span>
                <span className="text-sm font-bold" style={{ color: '#E8650A' }}>
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={100000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24"
              />
            </div>

            {/* Active filter count badge */}
            {hasActiveFilters && (
              <span className="badge badge-saffron flex items-center gap-1">
                <i className="ri-filter-3-line" />
                Filtered
              </span>
            )}

            {/* Result count (md+) */}
            <span className="hidden md:block text-gray-400 text-sm ml-auto">
              <span className="font-bold text-gray-700">{filtered.length}</span> results
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY PILL TABS — HORIZONTAL SCROLL
      ═══════════════════════════════════════════════════════════ */}
      <div className="border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="section-container">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {[ALL_CAT, ...mpCategories].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className={`filter-pill flex-shrink-0 flex items-center gap-1.5 ${activeCategory === cat.id ? 'active' : ''}`}
              >
                <span>{cat.icon}</span>
                {cat.label}
                {cat.id !== 'all' && (
                  <span
                    className="text-[9px] font-bold ml-0.5"
                    style={{ opacity: activeCategory === cat.id ? 0.7 : 0.5 }}
                  >
                    {mpProducts.filter((p) => p.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PRODUCT GRID
      ═══════════════════════════════════════════════════════════ */}
      <main className="section-container py-12">
        {/* Sub-header */}
        {!loading && (
          <Reveal className="flex items-center justify-between mb-8">
            <ResultCount n={filtered.length} category={activeCatLabel} />
            {activeCategory !== 'all' && (
              <button
                onClick={() => handleCategory('all')}
                className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <i className="ri-close-line" /> Clear category
              </button>
            )}
          </Reveal>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Products */}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={`${activeCategory}-${searchQ}-${maxPrice}-${sortBy}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {filtered.length === 0 ? (
                <EmptyState onClear={clearAll} />
              ) : (
                filtered.map((p) => (
                  <motion.div key={p.id} variants={cardVariants} layout>
                    <Cart {...p} url={p.image} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          MP PROMISE STRIP (bottom)
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="py-14 border-t"
        style={{ borderColor: 'rgba(232,101,10,0.1)', background: '#fff' }}
      >
        <div className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: 'ri-hand-heart-line',
                title: 'Artisan Direct',
                sub: '70%+ of every sale goes directly to the artisan\u2019s family.',
                color: '#E8650A',
              },
              {
                icon: 'ri-recycle-line',
                title: 'Sustainably Sourced',
                sub: 'Natural dyes, forest-harvested, zero synthetic chemicals.',
                color: '#1B6B3A',
              },
              {
                icon: 'ri-award-line',
                title: 'GI Authenticated',
                sub: 'Every craft product carries a GI tag or artisan certificate.',
                color: '#D4A017',
              },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${p.color}15`, color: p.color }}
                >
                  <i className={p.icon} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">{p.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={2500} />
    </div>
  );
};

export default ProductPage;
