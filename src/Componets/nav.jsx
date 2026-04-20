import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import lencheck from './lencheck';
import SearchModal from './Others/SearchModal';
import narmavyaLogo from '../assets/narmavya.png';

/* ─── Language Context ──────────────────────────────────────────────── */
export let globalLang = localStorage.getItem('narmavya_lang') || 'en';
const langListeners = new Set();
export const setGlobalLang = (lang) => {
  globalLang = lang;
  localStorage.setItem('narmavya_lang', lang);
  langListeners.forEach(fn => fn(lang));
};
export const useLang = () => {
  const [lang, setLang] = useState(globalLang);
  useEffect(() => {
    langListeners.add(setLang);
    return () => langListeners.delete(setLang);
  }, []);
  return lang;
};

/* ─── Nav Component ─────────────────────────────────────────────────── */
const Nav = () => {
  const [menu,         setMenu]         = useState(false);
  const [user,         setUser]         = useState(null);
  const [totalp,       settotalp]       = useState(0);
  const [login,        setlogin]        = useState(false);
  const [name,         setname]         = useState('');
  const [wishlistCount,setWishlistCount]= useState(0);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  /* Scroll-aware states (same logic as examplenav.jsx) */
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [navVisible,          setNavVisible]          = useState(true);
  const [isHovered,           setIsHovered]           = useState(false);
  const lastScrollY = useRef(0);

  const lang        = useLang();
  const navigate    = useNavigate();
  const location    = useLocation();
  const profileRef  = useRef(null);

  /* ── i18n strings ── */
  const t = {
    home:     lang === 'hi' ? 'होम'         : 'Home',
    products: lang === 'hi' ? 'उत्पाद'      : 'Products',
    about:    lang === 'hi' ? 'हमारे बारे'  : 'About MP',
    support:  lang === 'hi' ? 'सहायता'      : 'Support',
    login:    lang === 'hi' ? 'लॉग इन'      : 'Login',
    register: lang === 'hi' ? 'पंजीकरण'    : 'Register',
    logout:   lang === 'hi' ? 'लॉग आउट'    : 'Logout',
    profile:  lang === 'hi' ? 'प्रोफ़ाइल'   : 'My Profile',
    orders:   lang === 'hi' ? 'मेरे आदेश'  : 'My Orders',
    wishlist: lang === 'hi' ? 'पसंदीदा'    : 'Wishlist',
    search:   lang === 'hi' ? 'खोजें...'    : ' Search ',
    
  };

  /* ── Data init ── */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) { setUser(storedUser); setname(storedUser.name || ''); setlogin(true); }
    settotalp(lencheck());
    const wl = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlistCount(wl.length);
  }, []);

  /* ── Scroll: auto-hide + past-hero detection ── */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Hide nav on scroll-down, show on scroll-up
      if (currentY > lastScrollY.current && currentY > 80) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;

      // Detect if user scrolled past the hero viewport
      setIsScrolledPastHero(currentY > window.innerHeight - 80);

      // Close search bar on scroll
      if (searchOpen) setSearchOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchOpen]);

  /* ── Close profile on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── ⌘K shortcut ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Helpers ── */
  const logout = () => {
    sessionStorage.removeItem('login');
    setlogin(false);
    setProfileOpen(false);
    navigate('/');
  };

  const userLogo = () => {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return ((p[0]?.charAt(0) || '') + (p[1]?.charAt(0) || '')).toUpperCase();
  };

  const navLinks = [
    { name: t.home,     to: '/'        },
    { name: t.products, to: '/products'},
    { name: t.about,    to: '/about'   },
    { name: t.support,  to: '/Contact' },
  ];

  /* ── Derived style flags ── */
  // Nav is "light" (transparent) when: over the hero AND not hovered
  const isLight = !isScrolledPastHero && !isHovered;

  /* ── Icon / text colour helpers ── */
  const iconColor     = isLight ? 'text-white'     : 'text-gray-700';
  const iconHover     = isLight ? 'hover:text-white/70' : 'hover:text-[#E8650A]';
  const logoColor     = isLight
    ? { color: '#fff', WebkitTextFillColor: '#fff' }
    : {
        background: 'linear-gradient(135deg, #E8650A 0%, #D4A017 50%, #1B6B3A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
  const subLogoColor  = isLight ? 'text-white/60' : 'text-gray-500';
  const stripVisible  = isScrolledPastHero || isHovered; // hide top strip when over video

  return (
    <>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} lang={lang} />

      {/* ── NAV BAR ── */}
      <motion.nav
        className="w-full fixed z-50 transition-colors duration-300"
        style={{
          background: isLight
            ? 'transparent'
            : 'rgba(253,246,236,0.96)',
          backdropFilter: isLight ? 'none' : 'blur(14px)',
          borderBottom: isLight
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(232,101,10,0.12)',
          boxShadow: isLight ? 'none' : '0 2px 24px rgba(0,0,0,0.08)',
        }}
        /* Auto-hide translate */
        animate={{ y: navVisible ? 0 : '-100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        /* Hover triggers solid background */
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

{/* ── Main nav row ── */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5">

          {/* LEFT — links */}
            <div className="flex-1 flex items-center justify-start gap-6 sm:gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  className="text-m font-medium pb-1 transition-colors duration-200"
                  style={{
                    color: active
                      ? '#E8650A'
                      : isLight ? 'rgba(255,255,255,0.85)' : '#374151',
                    borderBottom: active ? '2px solid #E8650A' : '2px solid transparent',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          

          {/* CENTER — logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center">
            
            {/* Title & Icon Row */}
            <div className="flex items-center justify-center gap-2">
              <img 
                src={narmavyaLogo} 
                alt="Narmavya Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
              />
              <h1
                className="text-2xl sm:text-3xl font-black tracking-tight leading-none transition-all duration-300 mb-0"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  background: "linear-gradient(to right, #E67E22, #FF4500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}
              >
                Narmavya
              </h1>
            </div>

            {/* Tagline Row */}
            <p className={`text-[9px] tracking-[0.3em] font-medium uppercase mt-1 hidden sm:block transition-colors duration-300 ${subLogoColor}`}>
              {lang === 'hi' ? 'मध्यप्रदेश की आत्मा' : 'The Soul of Madhya Pradesh'}
            </p>
            
          </Link>

          {/* RIGHT — Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
            
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`hidden sm:flex items-center justify-between px-4 py-2.5 rounded-full border text-xs transition-all
                ${isLight
                  ? 'border-white/40 text-white/70 hover:border-white hover:text-white'
                  : 'border-gray-200 text-gray-500 hover:border-[#E8650A] hover:text-[#E8650A]'}`}
            >
              <i className="ri-search-line mr-2" />
              <span>{t.search}</span>
            </button>
            
            <button onClick={() => setSearchOpen(true)} className={`sm:hidden transition-colors ${iconColor} ${iconHover}`}>
              <i className="ri-search-line text-xl" />
            </button>

            {/* Profile Dropdown */}
            {!login ? (
              <Link to="/login" className={`hidden sm:inline font-semibold text-sm transition-colors ${isLight ? 'text-white hover:text-[#E8650A]' : 'text-gray-800 hover:text-[#E8650A]'}`}>
                {t.login}
              </Link>
            ) : (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(v => !v)} className="flex items-center gap-2 group">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ring-2"
                    style={{ background: 'linear-gradient(135deg, #E8650A, #1B6B3A)', ringColor: isLight ? 'rgba(255,255,255,0.4)' : 'rgba(232,101,10,0.3)' }}>
                    {userLogo()}
                  </div>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 top-12 w-56 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{ background: 'rgba(253,246,236,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(232,101,10,0.12)' }}
                    >
                      <div className="px-4 py-4 border-b border-orange-100">
                        <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
                        <p className="text-gray-400 text-xs mt-0.5 truncate">{user?.email}</p>
                      </div>
                      {[
                        { icon: 'ri-user-line', label: t.profile, to: '/profile' },
                        { icon: 'ri-shopping-bag-3-line', label: t.orders, to: '/orders' },
                        { icon: 'ri-heart-line', label: t.wishlist, to: '/wishlist' },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-sm text-gray-700 hover:text-[#E8650A]">
                          <i className={`${item.icon} text-base`} /> {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-orange-100">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-gray-500 hover:text-red-600">
                          <i className="ri-logout-box-r-line text-base" /> {t.logout}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Lang Toggle */}
            <button
              onClick={() => setGlobalLang(lang === 'en' ? 'hi' : 'en')}
              className={`hidden sm:flex items-center px-2 py-1 rounded-full border text-xs font-bold transition-all
                ${isLight ? 'border-white/40 text-white/80 hover:border-white' : 'border-gray-200 text-gray-600 hover:border-[#E8650A]'}`}
            >
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>

            {/* Wishlist */}
            <div className="relative cursor-pointer" onClick={() => navigate(login ? '/wishlist' : '/login')}>
              <i className={`ri-heart-line text-xl transition-colors ${iconColor} ${iconHover}`} />
              {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-bold">{wishlistCount}</span>}
            </div>

            {/* Cart */}
            <div className="relative cursor-pointer" onClick={() => navigate('/addToCart')}>
              <i className={`ri-shopping-bag-line text-xl transition-colors ${iconColor} ${iconHover}`} />
              <motion.span className="absolute -top-2 -right-2 bg-[#E8650A] text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-bold" animate={{ scale: totalp > 0 ? [1, 1.2, 1] : 1 }} transition={{ repeat: Infinity, duration: 2 }}>
                {totalp}
              </motion.span>
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenu(!menu)} className={`sm:hidden transition-colors ${iconColor} ${iconHover}`}>
              <i className={`${menu ? 'ri-close-line' : 'ri-menu-3-line'} text-2xl`} />
            </button>
          </div>
        </div>

        

        {/* ── Mobile Side Menu ── */}
        <AnimatePresence>
          {menu && (
            <motion.div
              className="sm:hidden fixed top-0 right-0 h-screen w-72 z-50 flex flex-col"
              style={{ background: 'linear-gradient(160deg, #3E1B00, #1B6B3A)' }}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/20">
                <span className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Narmavya
                </span>
                <button onClick={() => setMenu(false)} className="text-white">
                  <i className="ri-close-line text-2xl" />
                </button>
              </div>

              <nav className="flex flex-col p-5 gap-1 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setMenu(false)}
                    className="text-white/90 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 transition-all font-medium text-lg"
                  >
                    {link.name}
                  </Link>
                ))}
                {login && (
                  <>
                    <div className="border-t border-white/20 my-2" />
                    <Link to="/profile" onClick={() => setMenu(false)} className="text-white/80 hover:text-white py-2 px-4 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                      <i className="ri-user-line" /> {t.profile}
                    </Link>
                    <Link to="/orders" onClick={() => setMenu(false)} className="text-white/80 hover:text-white py-2 px-4 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                      <i className="ri-shopping-bag-3-line" /> {t.orders}
                    </Link>
                  </>
                )}
              </nav>

              <div className="p-5 border-t border-white/20 flex flex-col gap-3">
                <button
                  onClick={() => setGlobalLang(lang === 'en' ? 'hi' : 'en')}
                  className="w-full py-2 rounded-full border border-white/40 text-white text-sm font-semibold"
                >
                  {lang === 'en' ? '🇮🇳 हिंदी में देखें' : '🇬🇧 View in English'}
                </button>
                {!login ? (
                  <>
                    <Link to="/login"  onClick={() => setMenu(false)} className="w-full text-center py-2.5 rounded-full bg-[#E8650A] text-white font-bold">{t.login}</Link>
                    <Link to="/signUp" onClick={() => setMenu(false)} className="w-full text-center py-2.5 rounded-full border border-white text-white font-bold">{t.register}</Link>
                  </>
                ) : (
                  <button onClick={() => { logout(); setMenu(false); }} className="w-full py-2.5 rounded-full border border-white text-white font-bold">
                    {t.logout}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile overlay */}
        <AnimatePresence>
          {menu && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-end ..."
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenu(false)}
            />
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Nav;
