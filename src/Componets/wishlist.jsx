import React, { useState, useEffect, useRef } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cart from './Others/carts';

/* ─── Reveal animation wrapper ────────────────────────────────── */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem('wishlist')) || [];
    setItems(wl);
  }, []);

  const removeFromWishlist = (id) => {
    const newWl = items.filter((i) => i.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(newWl));
    setItems(newWl);
    toast.info('Removed from wishlist');
  };

  const clearAll = () => {
    localStorage.setItem('wishlist', JSON.stringify([]));
    setItems([]);
    toast.info('Wishlist cleared');
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture">
      <Nav />

      {/* ─── Cinematic Page Header ─── */}
      <header
        className="relative overflow-hidden flex items-end"
        style={{ paddingTop: '96px', minHeight: '260px' }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #3E1B00 0%, #1B6B3A 100%)',
          }}
        />
        <div className="absolute inset-0 z-10 bagh-stripe opacity-15 pointer-events-none" />
        <div className="relative z-20 section-container w-full pb-10">
          <p className="label-overline text-white/40 mb-3">Your Collection</p>
          <h1
            className="font-display font-black text-white leading-none mb-2"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            Wishlist
          </h1>
          <p className="text-white/50 text-sm">
            <span className="font-bold text-white">{items.length}</span> saved
            {items.length === 1 ? ' treasure' : ' treasures'} from MP artisans
          </p>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="section-container py-12 min-h-[50vh]">
        {items.length > 0 && (
          <Reveal className="flex justify-end mb-6">
            <button
              onClick={clearAll}
              className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors font-medium"
            >
              <i className="ri-delete-bin-line" /> Clear All
            </button>
          </Reveal>
        )}

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-24"
          >
            <div
              className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-8 text-5xl"
              style={{ background: 'rgba(232,101,10,0.06)' }}
            >
              🤍
            </div>
            <h3
              className="text-2xl font-display font-black text-gray-800 mb-3"
            >
              Your Wishlist is Empty
            </h3>
            <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              Save your favorite MP products and artisan crafts. 
              They'll be waiting here when you're ready.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary px-10 py-4 text-sm"
            >
              Discover MP Products →
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative"
                >
                  <Cart {...item} url={item.image || item.url} />
                  {/* Prominent Remove button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 h-9 w-9 bg-rose-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 hover:scale-110 transition-all z-20"
                    title="Remove from Wishlist"
                  >
                    <i className="ri-heart-fill text-sm" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={2500} />
    </div>
  );
};

export default Wishlist;
