import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mpProducts, mpCategories } from '../../data/mpProducts';

// ── Fuzzy match: tolerates typos like "Chandari" → "Chanderi" ───────────────
function fuzzyScore(str, pattern) {
  str = str.toLowerCase();
  pattern = pattern.toLowerCase();
  if (str.includes(pattern)) return 100;
  let score = 0, pi = 0;
  for (let si = 0; si < str.length && pi < pattern.length; si++) {
    if (str[si] === pattern[pi]) { score += 10; pi++; }
  }
  return pi === pattern.length ? score : 0;
}

function searchProducts(query) {
  if (!query.trim()) return [];
  const results = [];
  for (const p of mpProducts) {
    const scores = [
      fuzzyScore(p.title, query) * 2,
      fuzzyScore(p.description || '', query),
      fuzzyScore(p.origin || '', query),
      fuzzyScore(p.artisan || '', query),
      fuzzyScore(p.category, query),
      fuzzyScore(p.badge || '', query),
    ];
    const best = Math.max(...scores);
    if (best > 0) results.push({ ...p, _score: best });
  }
  return results.sort((a, b) => b._score - a._score).slice(0, 7);
}

const SearchModal = ({ isOpen, onClose, lang = 'en' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const r = searchProducts(query);
    setResults(r);
    setSelected(0);
  }, [query]);

  const goToProduct = useCallback((id) => {
    navigate(`/product/${id}`);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  const goToCategory = useCallback((cat) => {
    navigate(cat === 'all' ? '/products' : `/products/${cat}`);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) goToProduct(results[selected].id);
    if (e.key === 'Escape') onClose();
  };

  // Quick category shortcuts
  const shortcuts = !query.trim() ? mpCategories.slice(0, 6) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[12vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-2xl mx-4"
          >
            <div className="rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.45)]"
              style={{ background: 'rgba(253,246,236,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(232,101,10,0.15)' }}>

              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-orange-100">
                <i className="ri-search-line text-xl text-[#E8650A]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={lang === 'hi' ? 'खोजें — चंदेरी, गोंड, बाघ प्रिंट...' : 'Search — Chanderi silk, Gond art, Bagh print...'}
                  className="flex-1 bg-transparent outline-none text-lg text-gray-900 placeholder:text-gray-400 font-medium"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="ri-close-circle-fill text-xl" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-mono">
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Category shortcuts (shown when no query) */}
                {shortcuts.length > 0 && (
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                      {lang === 'hi' ? 'श्रेणियाँ' : 'Browse Categories'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {shortcuts.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => goToCategory(cat.id)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left hover:bg-orange-50 transition-colors group"
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#E8650A] transition-colors">
                            {lang === 'hi' ? cat.labelHi : cat.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { navigate('/products'); onClose(); }}
                      className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-[#E8650A] hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                    >
                      {lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All 84+ Products'} <i className="ri-arrow-right-line" />
                    </button>
                  </div>
                )}

                {/* Search Results */}
                {query.trim() && results.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-500 text-sm font-medium">
                      {lang === 'hi' ? `"${query}" के लिए कुछ नहीं मिला` : `No results for "${query}"`}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {lang === 'hi' ? 'कोशिश करें: गोंड, बाघ, चंदेरी' : 'Try: Gond, Bagh, Chanderi, Gwalior'}
                    </p>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
                      {results.length} {lang === 'hi' ? 'परिणाम' : 'Results'}
                    </p>
                    {results.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => goToProduct(p.id)}
                        onMouseEnter={() => setSelected(i)}
                        className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-all text-left mb-1 ${
                          selected === i ? 'bg-orange-50 shadow-sm' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8650A]">
                              {p.badge}
                            </span>
                            <span className="text-[10px] text-gray-400">·</span>
                            <span className="text-[10px] text-gray-500">{p.origin}</span>
                          </div>
                        </div>
                        {/* Price + Stock */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-[#E8650A] text-sm">₹{p.price.toLocaleString()}</p>
                          {p.stock <= 5 && (
                            <p className="text-[10px] text-rose-500 font-semibold">🔥 Only {p.stock} left</p>
                          )}
                        </div>
                        {selected === i && (
                          <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer tip */}
              <div className="px-5 py-3 border-t border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><kbd className="font-mono px-1.5 py-0.5 bg-gray-100 rounded-md">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono px-1.5 py-0.5 bg-gray-100 rounded-md">↵</kbd> Open</span>
                </div>
                <span className="text-[10px] text-gray-400">🌿 Narmavya Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
