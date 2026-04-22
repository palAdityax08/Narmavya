import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Nav from './nav';
import Footer from './Others/Footer';
import Cart from './Others/carts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mpProducts, mpCategories } from '../data/mpProducts';
import {
  motion, AnimatePresence, useScroll, useTransform, useInView,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: 'default',    label: 'Recommended'       },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated'     },
  { value: 'newest',     label: 'Newest First'      },
];

const ALL_CAT = { id: 'all', label: 'All Products', icon: '🏛️' };

const PRICE_PRESETS = [
  { label: 'Under ₹500',  max: 500   },
  { label: 'Under ₹1000', max: 1000  },
  { label: 'Under ₹2500', max: 2500  },
  { label: 'Under ₹5000', max: 5000  },
  { label: 'Any Price',   max: 100000},
];

/* ═══════════════════════════════════════════════════════════════
   FRAMER VARIANTS
═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -14, scale: 0.95, transition: { duration: 0.25 } },
};

/* ═══════════════════════════════════════════════════════════════
   SMALL UTILITIES
═══════════════════════════════════════════════════════════════ */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-[20px] overflow-hidden w-full border border-gray-100 flex flex-col">
    <div className="h-64 shimmer-bg" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-2/3 shimmer-bg rounded" />
      <div className="h-4 w-full shimmer-bg rounded" />
      <div className="h-6 w-1/2 shimmer-bg rounded mt-2" />
    </div>
  </div>
);

const EmptyState = ({ onClear }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    className="col-span-full flex flex-col items-center justify-center py-32 text-center">
    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 text-5xl"
      style={{ background: 'rgba(232,101,10,0.08)' }}>🔍</div>
    <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">Nothing found</h3>
    <p className="text-gray-400 text-sm mb-8 max-w-xs">
      Try a different search, adjust the price range, or remove a filter.
    </p>
    <button onClick={onClear} className="btn-primary text-sm px-8 py-3">Clear All Filters</button>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   ACTIVE FILTER PILLS — shareable state display
═══════════════════════════════════════════════════════════════ */
const ActiveFilters = ({ searchQ, sortBy, maxPrice, giOnly, onClear, onRemove }) => {
  const pills = [];
  if (searchQ)         pills.push({ key:'q',    label: `"${searchQ}"` });
  if (sortBy !== 'default') pills.push({ key:'sort', label: SORT_OPTIONS.find(o=>o.value===sortBy)?.label });
  if (maxPrice < 100000)    pills.push({ key:'max',  label: `≤ ₹${maxPrice.toLocaleString()}` });
  if (giOnly)               pills.push({ key:'gi',   label: 'GI Tagged only' });
  if (pills.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap mt-3">
      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active:</span>
      {pills.map(p => (
        <span key={p.key}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200 text-[#E8650A] bg-orange-50">
          {p.label}
          <button onClick={() => onRemove(p.key)} className="hover:text-red-500 transition-colors">
            <i className="ri-close-line text-xs" />
          </button>
        </span>
      ))}
      <button onClick={onClear}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors font-semibold ml-1">
        Clear all ✕
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR FILTER PANEL (slides in on mobile)
═══════════════════════════════════════════════════════════════ */
const FilterSidebar = ({
  open, onClose,
  sortBy, setSortBy,
  maxPrice, setMaxPrice,
  giOnly, setGiOnly,
  activeCategory, handleCategory,
}) => (
  <AnimatePresence>
    {open && (
      <>
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose} />

        {/* Panel */}
        <motion.aside
          initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-screen w-80 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#E8650A,#C4500A)' }}>
                <i className="ri-filter-3-line text-white text-sm" />
              </div>
              <h3 className="font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>Filters</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <i className="ri-close-line text-gray-600" />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-8">
            {/* Category */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</p>
              <div className="space-y-1">
                {[ALL_CAT, ...mpCategories].map(cat => (
                  <button key={cat.id}
                    onClick={() => { handleCategory(cat.id); onClose(); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-orange-50 text-[#E8650A] font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span className="flex items-center gap-2">{cat.icon} {cat.label}</span>
                    <span className="text-xs text-gray-400">
                      {cat.id === 'all' ? mpProducts.length : mpProducts.filter(p=>p.category===cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sort By</p>
              <div className="space-y-1">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value}
                    onClick={() => setSortBy(o.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sortBy === o.value ? 'bg-orange-50 text-[#E8650A] font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {sortBy === o.value ? <i className="ri-radio-button-fill text-[#E8650A]" /> : <i className="ri-radio-button-line text-gray-300" />}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price Range</p>
              <div className="space-y-1">
                {PRICE_PRESETS.map(p => (
                  <button key={p.max}
                    onClick={() => setMaxPrice(p.max)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      maxPrice === p.max ? 'bg-orange-50 text-[#E8650A] font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Range slider */}
              <div className="mt-4 px-1">
                <input type="range" min={100} max={100000} step={100}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#E8650A]" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹100</span>
                  <span className="font-bold text-[#E8650A]">₹{maxPrice.toLocaleString()}</span>
                  <span>₹1,00,000</span>
                </div>
              </div>
            </div>

            {/* GI Tag toggle */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Certification</p>
              <label className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div
                  className={`w-11 h-6 rounded-full relative transition-colors ${giOnly ? 'bg-[#D4A017]' : 'bg-gray-200'}`}
                  onClick={() => setGiOnly(!giOnly)}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all ${giOnly ? 'left-5' : 'left-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">🏅 GI Tagged Only</p>
                  <p className="text-xs text-gray-400">Show only Government certified products</p>
                </div>
              </label>
            </div>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════
   PRODUCT PAGE — Phase 5A: full URL param sync
═══════════════════════════════════════════════════════════════ */
const ProductPage = () => {
  const { category }              = useParams();
  const navigate                  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read initial state FROM URL (makes links shareable / bookmarkable) ──────
  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [searchQ,  setSearchQ]  = useState(searchParams.get('q')    || '');
  const [sortBy,   setSortBy]   = useState(searchParams.get('sort') || 'default');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('max')) || 100000);
  const [giOnly,   setGiOnly]   = useState(searchParams.get('gi') === 'true');

  const [filtered,    setFiltered]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── SYNC: URL → state (on back/forward navigation) ─────────────────────────
  useEffect(() => {
    setSearchQ(searchParams.get('q')    || '');
    setSortBy(searchParams.get('sort')  || 'default');
    setMaxPrice(Number(searchParams.get('max')) || 100000);
    setGiOnly(searchParams.get('gi') === 'true');
  }, [searchParams]);

  useEffect(() => {
    setActiveCategory(category || 'all');
  }, [category]);

  // ── SYNC: state → URL (push to history so back button works) ───────────────
  const pushParams = useCallback((overrides = {}) => {
    const base = {
      q:    searchQ,
      sort: sortBy,
      max:  maxPrice < 100000 ? String(maxPrice) : '',
      gi:   giOnly ? 'true' : '',
      ...overrides,
    };
    const next = new URLSearchParams();
    Object.entries(base).forEach(([k, v]) => { if (v) next.set(k, v); });
    setSearchParams(next, { replace: true });
  }, [searchQ, sortBy, maxPrice, giOnly, setSearchParams]);

  // Debounce param push to avoid flooding history on slider drag
  const pushTimer = useRef(null);
  const debouncedPush = (overrides) => {
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushParams(overrides), 300);
  };

  const handleSortChange = (v) => { setSortBy(v);       debouncedPush({ sort: v }); };
  const handleMaxChange  = (v) => { setMaxPrice(v);     debouncedPush({ max: v < 100000 ? String(v) : '' }); };
  const handleGiChange   = (v) => { setGiOnly(v);       debouncedPush({ gi: v ? 'true' : '' }); };
  const handleSearch     = (v) => { setSearchQ(v);      debouncedPush({ q: v }); };

  const handleCategory = (id) => {
    setActiveCategory(id);
    const path = id === 'all' ? '/products' : `/products/${id}`;
    // Preserve other query params
    navigate({ pathname: path, search: searchParams.toString() }, { replace: true });
  };

  const clearAll = () => {
    setSearchQ(''); setSortBy('default'); setMaxPrice(100000); setGiOnly(false);
    setActiveCategory('all');
    setSearchParams({}, { replace: true });
    navigate('/products', { replace: true });
  };

  const removeFilter = (key) => {
    if (key === 'q')    { setSearchQ('');          debouncedPush({ q: '' }); }
    if (key === 'sort') { setSortBy('default');    debouncedPush({ sort: '' }); }
    if (key === 'max')  { setMaxPrice(100000);     debouncedPush({ max: '' }); }
    if (key === 'gi')   { setGiOnly(false);        debouncedPush({ gi: '' }); }
  };

  // ── Filter + sort engine ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let result = [...mpProducts];
      if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        result = result.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.artisan?.toLowerCase().includes(q)
        );
      }
      if (maxPrice < 100000) result = result.filter(p => p.price <= maxPrice);
      if (giOnly) result = result.filter(p => p.badge?.toLowerCase().includes('gi'));
      if (sortBy === 'price-asc')  result.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
      if (sortBy === 'rating')     result.sort((a, b) => b.rating - a.rating);
      if (sortBy === 'newest')     result.reverse();
      setFiltered(result);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQ, maxPrice, sortBy, giOnly]);

  const hasActiveFilters = searchQ || activeCategory !== 'all' || maxPrice < 100000 || sortBy !== 'default' || giOnly;

  // ── Parallax header ─────────────────────────────────────────────────────────
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const headerImgY   = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const activeCatLabel = activeCategory === 'all'
    ? 'MP Marketplace'
    : mpCategories.find(c => c.id === activeCategory)?.label || activeCategory;

  return (
    <div className="min-h-screen gond-texture">
      <Nav />

      {/* Slide-in filter sidebar */}
      <FilterSidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        sortBy={sortBy} setSortBy={handleSortChange}
        maxPrice={maxPrice} setMaxPrice={handleMaxChange}
        giOnly={giOnly} setGiOnly={handleGiChange}
        activeCategory={activeCategory} handleCategory={handleCategory}
      />

      {/* ═══════════════════════════════════════════════════════════
          IMMERSIVE PAGE HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header ref={headerRef} className="relative overflow-hidden flex items-end"
        style={{ paddingTop: '96px', minHeight: '320px' }}>
        <motion.div className="absolute inset-0 z-0" style={{ y: headerImgY }}>
          <img
            src="https://indiacinehub.gov.in/sites/default/files/styles/flexslider_full/public/2024-02/a2e65750d845c41f2f26279be1d7565b.jpg?itok=gOKzctW-"
            alt="MP Marketplace" className="w-full h-full object-cover scale-110" />
        </motion.div>
        <div className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(135deg, rgba(62,27,0,0.9) 0%, rgba(27,107,58,0.7) 100%)' }} />
        <div className="absolute inset-0 z-10 bagh-stripe opacity-15 pointer-events-none" />

        <motion.div className="relative z-20 section-container w-full pb-12" style={{ opacity: headerOpacity }}>
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

          <div className="label-overline text-white/40 mb-3">MP Marketplace</div>
          <h1 className="font-display font-black text-white leading-none mb-3"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}>
            {activeCatLabel}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-white/50 text-sm">
              <span className="font-bold text-white">{filtered.length || mpProducts.length}</span> authentic MP products
            </p>
            {/* Shareable URL indicator */}
            {hasActiveFilters && (
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-all"
                title="Copy shareable link">
                <i className="ri-link-m" /> Copy filter link
              </button>
            )}
          </div>
        </motion.div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          STICKY TOOLBAR
      ═══════════════════════════════════════════════════════════ */}
      <div className="sticky top-[85px] z-30 border-b shadow-sm"
        style={{ background: 'rgba(253,246,236,0.96)', backdropFilter: 'blur(20px)', borderColor: 'rgba(232,101,10,0.1)' }}>
        <div className="section-container">
          <div className="flex items-center gap-3 py-4 flex-wrap">

            {/* Filter toggle button (opens sidebar) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                hasActiveFilters
                  ? 'border-[#E8650A] text-[#E8650A] bg-orange-50'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-[#E8650A] hover:text-[#E8650A]'
              }`}>
              <i className="ri-filter-3-line" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-[#E8650A] text-white text-[9px] font-black flex items-center justify-center">
                  {[searchQ, sortBy !== 'default', maxPrice < 100000, giOnly].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text" value={searchQ}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search products, artisans, districts…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-white focus:border-[#E8650A] outline-none text-sm transition-all shadow-sm"
              />
              <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQ && (
                <button onClick={() => handleSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line" />
                </button>
              )}
            </div>

            {/* Sort selector */}
            <div className="relative">
              <select value={sortBy} onChange={e => handleSortChange(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border-2 border-transparent bg-white text-sm outline-none cursor-pointer shadow-sm focus:border-[#E8650A] appearance-none font-medium text-gray-700 transition-all">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className="ri-sort-desc absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* GI tag quick toggle */}
            <button
              onClick={() => handleGiChange(!giOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                giOnly
                  ? 'border-[#D4A017] text-[#a87a00] bg-amber-50'
                  : 'border-gray-200 text-gray-500 bg-white hover:border-[#D4A017] hover:text-[#a87a00]'
              }`}
              title="Show only GI Tagged products">
              🏅 <span className="hidden sm:inline">GI Only</span>
            </button>

            {/* Result count */}
            <span className="hidden md:block text-gray-400 text-sm ml-auto">
              <span className="font-bold text-gray-700">{filtered.length}</span> results
            </span>
          </div>

          {/* Active filter pills */}
          <ActiveFilters
            searchQ={searchQ} sortBy={sortBy} maxPrice={maxPrice} giOnly={giOnly}
            onClear={clearAll} onRemove={removeFilter}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY PILL TABS
      ═══════════════════════════════════════════════════════════ */}
      <div className="border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="section-container">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {[ALL_CAT, ...mpCategories].map(cat => (
              <button key={cat.id} onClick={() => handleCategory(cat.id)}
                className={`filter-pill flex-shrink-0 flex items-center gap-1.5 ${activeCategory === cat.id ? 'active' : ''}`}>
                <span>{cat.icon}</span>
                {cat.label}
                {cat.id !== 'all' && (
                  <span className="text-[9px] font-bold ml-0.5"
                    style={{ opacity: activeCategory === cat.id ? 0.7 : 0.5 }}>
                    {mpProducts.filter(p => p.category === cat.id).length}
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
        {!loading && (
          <Reveal className="flex items-center justify-between mb-8">
            <p className="text-gray-500 text-sm">
              Showing <span className="font-bold text-gray-900">{filtered.length}</span> products
              {activeCategory !== 'all' && (
                <> in <span className="font-bold" style={{ color: '#E8650A' }}>{activeCatLabel}</span></>
              )}
              {giOnly && <span className="ml-2 text-[#D4A017] font-semibold text-xs">🏅 GI Tagged</span>}
            </p>
            {activeCategory !== 'all' && (
              <button onClick={() => handleCategory('all')}
                className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                <i className="ri-close-line" /> Clear category
              </button>
            )}
          </Reveal>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={`${activeCategory}-${searchQ}-${maxPrice}-${sortBy}-${giOnly}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants} initial="hidden" animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              {filtered.length === 0 ? (
                <EmptyState onClear={clearAll} />
              ) : (
                filtered.map(p => (
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
          MP PROMISE STRIP
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-t" style={{ borderColor: 'rgba(232,101,10,0.1)', background: '#fff' }}>
        <div className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: 'ri-hand-heart-line',  title: 'Artisan Direct',       sub: '70%+ of every sale goes directly to the artisan\'s family.', color: '#E8650A' },
              { icon: 'ri-recycle-line',      title: 'Sustainably Sourced',  sub: 'Natural dyes, forest-harvested, zero synthetic chemicals.',   color: '#1B6B3A' },
              { icon: 'ri-award-line',        title: 'GI Authenticated',     sub: 'Every craft product carries a GI tag or artisan certificate.', color: '#D4A017' },
            ].map(p => (
              <div key={p.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${p.color}15`, color: p.color }}>
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
