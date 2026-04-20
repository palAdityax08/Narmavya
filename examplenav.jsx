import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import lencheck from './lencheck';
import { motion, AnimatePresence } from 'framer-motion';
import narmavyaLogo from '../assets/narmavy.png';

const Nav = () => {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [user, setUser] = useState(null);
  const [totalp, settotalp] = useState(0);
  const [login, setlogin] = useState(false);
  const [name, setname] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setname(storedUser.name);
      setlogin(true);
    }
  }, []);

  useEffect(() => {
    settotalp(lencheck());
  }, []);

  useEffect(() => {
    if (search && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [search]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Auto-hide/show navbar logic
      if (currentScrollY > lastScrollY && currentScrollY > 70) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Change icon colors after scrolling past hero section
      if (currentScrollY > window.innerHeight - 70) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
      }
      
      if (search) {
        setSearch(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, search]);
  
  const logout = () => {
    sessionStorage.removeItem('login');
    setlogin(false);
    navigate('/login');
  };

  const userLogo = () => {
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return '';
  };

  const menuVariants = {
    hidden: { x: '-100%' },
    visible: { x: '0%', transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { x: '-100%', transition: { duration: 0.2 } },
  };

  const badgeVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { duration: 0.3 } },
    pulse: { scale: [1, 1.2, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } },
  };

  const navClasses = clsx(
    'w-full h-[70px] px-4 sm:px-6 fixed z-50 transition-all duration-300 transform',
    {
      'bg-white shadow-lg': isScrolledPastHero || isHovered,
      'bg-transparent': !isScrolledPastHero && !isHovered,
      '-translate-y-full': !navVisible,
      'translate-y-0': navVisible,
    }
  );

  const iconClasses = clsx(
    'text-2xl',
    {
      'text-white': !isScrolledPastHero && !isHovered,
      'text-gray-700': isScrolledPastHero || isHovered,
    }
  );

  return (
    <motion.nav
      className={navClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between py-3">
        {/* Left Section - Menu and Search Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMenu(!menu)}
            className={iconClasses}
          >
            <i className="ri-menu-line"></i>
          </button>
          <div className="relative flex items-center">
            <button onClick={() => setSearch(!search)} className={iconClasses}>
              <i className="ri-search-line"></i>
            </button>
            <AnimatePresence>
              {search && (
                <motion.input
                  ref={searchInputRef}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '150px', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  placeholder="Search products..."
                  className="ml-2 p-1 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Section - Logo */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="flex items-center gap-2">
            <img src={narmavyaLogo} alt="Narmavya Logo" className="w-48 h-12" />
         
          </Link>
        </div>

        {/* Right Section - Auth, Wishlist and Cart */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {login ? (
              <>
                <Link to="/profile" className={clsx("hover:text-green-600 transition-colors duration-300", { 'text-white': !isScrolledPastHero && !isHovered, 'text-gray-700': isScrolledPastHero || isHovered })}>
                  <i className="ri-user-3-line text-2xl"></i>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={clsx("hover:text-green-600 transition-colors duration-300", { 'text-white': !isScrolledPastHero && !isHovered, 'text-gray-700': isScrolledPastHero || isHovered })}>
                  <i className="ri-user-3-line text-2xl"></i>
                </Link>
              </>
            )}
          </div>
          <button className={clsx("", { 'text-white': !isScrolledPastHero && !isHovered, 'text-gray-700': isScrolledPastHero || isHovered })}>
            <i className="ri-heart-line text-2xl"></i>
          </button>
          <div
            className="relative cursor-pointer"
            onClick={() => navigate('/addToCart')}
          >
            <i className={clsx("ri-shopping-bag-line text-2xl", { 'text-white': !isScrolledPastHero && !isHovered, 'text-gray-700': isScrolledPastHero || isHovered })}></i>
            <motion.div
              className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-md"
              variants={badgeVariants}
              initial="hidden"
              animate={totalp > 0 ? 'pulse' : 'visible'}
            >
              {totalp}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed top-0 left-0  w-64 bg-white backdrop-blur-sm shadow-xl z-50 flex flex-col p-6"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
              <button onClick={() => setMenu(false)} className="text-gray-700">
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>

            {/* Menu Items */}
            <ul className="flex-grow space-y-4 text-lg text-blacky-700 font-medium">
              <li><Link to="/products/Art" onClick={() => setMenu(false)} className="hover:text-yellow-600">Art & Decor</Link></li>
              <li><Link to="/products/Textiles" onClick={() => setMenu(false)} className="hover:text-yellow-600">Textile Heritage</Link></li>
              <li><Link to="/products/Tribal" onClick={() => setMenu(false)} className="hover:text-yellow-600">Tribal Treasures</Link></li>
              <li><Link to="/products/Food" onClick={() => setMenu(false)} className="hover:text-yellow-600">Taste of MP</Link></li>
              <li><Link to="/products/Eco" onClick={() => setMenu(false)} className="hover:text-yellow-600">Eco Living</Link></li>
              <li><Link to="/products/Gifts" onClick={() => setMenu(false)} className="hover:text-yellow-600">Gift Boxes & Curations</Link></li>
            </ul>

            <div className="space-y-4 pt-64  border-t border-gray-200 text-lg text-black-700 font-medium">
              <ul className="space-y-8">
                <li><Link to="/about" onClick={() => setMenu(false)} className="hover:text-yellow-600">About Us</Link></li>
                <li><Link to="/contact" onClick={() => setMenu(false)} className="hover:text-yellow-600">Customer Care</Link></li>
              </ul>
              {login && (
                <div className="pt-2">
                  <button
                    onClick={() => { logout(); setMenu(false); }}
                    className="w-full text-left p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Nav;