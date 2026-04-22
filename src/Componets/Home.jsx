import React, { useState, useEffect, useRef } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import Cart from './Others/carts';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import { mpProducts, mpCategories, artisans, testimonials } from '../data/mpProducts';
import narmavyaVideo from '../assets/nirr_video.mp4.mp4';
import image1 from '../assets/image1.png';

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ═══════════════════════════════════════════════════════════════════
   TICKER ITEMS
═══════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════
   SECTION REVEAL WRAPPER
═══════════════════════════════════════════════════════════════════ */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   EDITORIAL OVERLINE + HEADING
═══════════════════════════════════════════════════════════════════ */
const EditorialHeading = ({ overline, title, sub, center = true, light = false }) => (
  <div className={center ? 'text-center' : ''}>
    <div className={`label-overline mb-4 ${center ? 'justify-center' : ''} ${light ? 'text-white/60' : ''}`}
      style={light ? { color: 'rgba(255,255,255,0.6)' } : {}}
    >
      {overline}
    </div>
    <h2
      className={`font-display font-black leading-tight tracking-tight ${light ? 'text-white' : ''}`}
      style={{
        fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
        ...(light ? {} : {
          background: 'linear-gradient(135deg, #E8650A 0%, #1B6B3A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }),
      }}
    >
      {title}
    </h2>
    {sub && (
      <p className={`mt-3 text-sm leading-relaxed max-w-lg ${center ? 'mx-auto' : ''} ${light ? 'text-white/60' : 'text-gray-500'}`}>
        {sub}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   PARALLAX IMAGE SECTION
═══════════════════════════════════════════════════════════════════ */
const ParallaxBanner = ({ img, children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-3xl">
      <motion.div className="absolute inset-0 z-0 scale-110" style={{ y }}>
        <img src={img} alt="" className="w-full h-full object-cover" />
      </motion.div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   HOME COMPONENT
═══════════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const heroRef  = useRef(null);
  const contentRef = useRef(null);

  const featured    = mpProducts.filter((p) => p.badge === 'Bestseller' || p.badge === 'GI Tagged').slice(0, 6);
  const organic     = mpProducts.filter((p) => p.category === 'organic-food' || p.category === 'organic-spices').slice(0, 4);
  const handicrafts = mpProducts.filter((p) => p.category === 'handicrafts').slice(0, 3);

  /* Scroll parallax for text content */
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroTextY   = useTransform(heroScroll, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  const handleScrollToContent = () =>
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="w-full gond-texture">
      <Nav />

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC HERO — VIDEO BACKGROUND
      ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: '100svh', minHeight: 600 }}
      >
        {/* ── VIDEO LAYER ── */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.82) saturate(1.15)' }}
        >
          <source src={narmavyaVideo} type="video/mp4" />
        </video>

        {/* ── LAYERED CINEMATIC VEIL ── */}
        {/* Deep gradient bottom-to-top */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(10,5,0,0.92) 0%, rgba(10,5,0,0.45) 45%, rgba(10,5,0,0.10) 100%)',
          }}
        />
        {/* Side vignettes */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        {/* Bagh-stripe cultural texture */}
        <div className="absolute inset-0 z-10 bagh-stripe opacity-20 pointer-events-none" />

        {/* ── HERO CONTENT ── */}
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center text-center h-full px-6"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          {/* Animated overline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#E8650A]" />
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#E8650A]">
              Welcome to Narmavya
            </span>
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#E8650A]" />
          </motion.div>

          {/* Headline line 1 */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-white leading-none"
            style={{
              fontSize: 'clamp(3.2rem, 11vw, 7rem)',
              letterSpacing: '-0.03em',
              textShadow: '0 4px 60px rgba(0,0,0,0.5)',
            }}
          >
            The Heart &amp; Craft
          </motion.h1>

          {/* Headline line 2 — accent */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            /* CHANGED: swapped leading-none for leading-tight, added pb-2 */
            className="font-display font-black leading-tight mb-7 pb-2"
            style={{
              fontSize: 'clamp(4rem, 12vw, 8rem)',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #E8650A 0%, #D4A017 60%, #E8650A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 60px rgba(232,101,10,0.45))',
            }}
          >
            of Madhya Pradesh
          </motion.h1>

          {/* Sub text */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/65 max-w-xl text-base sm:text-lg leading-relaxed mb-11"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
          >
            Born of a dream to revive our region's artisanal traditions — Narmavya brings
            handcrafted luxury, tribal art &amp; organic produce straight from the heart of India.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/products"
              className="btn-primary text-sm px-9 py-4 rounded-full"
              style={{ boxShadow: '0 0 40px rgba(232,101,10,0.45)' }}
            >
              Explore Products &nbsp;<i className="ri-arrow-right-line" />
            </Link>
            <Link
              to="/about"
              className="btn-ghost-white text-sm px-9 py-4 rounded-full"
            >
              Discover Our Story
            </Link>
          </motion.div>

          {/* ── Scroll hint — animated bounce ── */}
          <motion.button
            onClick={handleScrollToContent}
            className="absolute bottom-9 left-1/2.5 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-0 outline-none"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          >
            <span className="text-[10px] tracking-[0.3em] uppercase">Discover</span>
            {/* Animated chevrons */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>

          {/* Corner badge — live videos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="absolute bottom-9 right-7 hidden sm:flex items-center gap-2 text-white/50 text-xs"
          >
            
          </motion.div>
        </motion.div>
      </section>

      {/* Content anchor */}
      <div ref={contentRef} />



      {/* ═══════════════════════════════════════════════════════════
          CATEGORY EXPLORER — HORIZONTAL SCROLLABLE CHIPS
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-container py-10 sm:py-16">
        <Reveal>
          <EditorialHeading
            overline="Shop by Category"
            title="Explore MP's Treasures"
            sub="Six categories, each a world of heritage — curated from MP's finest artisan clusters."
          />
        </Reveal>

        <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {mpCategories.map((cat, idx) => {
            const count = mpProducts.filter((p) => p.category === cat.id).length;
            return (
              <Reveal key={cat.id} delay={idx * 0.07}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/products/${cat.id}`)}
                  className="bento-cell p-5 flex flex-col items-center gap-3 cursor-pointer text-center"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${cat.color} shadow-md`}
                  >
                    {cat.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-xs leading-tight">{cat.label}</p>
                  <p className="text-[10px] text-gray-400">{count} products</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED PRODUCTS — EDITORIAL GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FDF6EC 100%)' }}>
        <div className="section-container">
          <Reveal className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-14">
            <EditorialHeading
              overline="Top Picks"
              title="Featured Products"
              sub="Bestsellers and GI-tagged heritage gems, handpicked by our artisan curators."
              center={false}
            />
            <Link to="/products" className="btn-primary whitespace-nowrap flex-shrink-0 text-sm px-7 py-3">
              View All <i className="ri-arrow-right-line" />
            </Link>
          </Reveal>

          {/* Masonry-feel responsive grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {featured.map((p, i) => (
              <motion.div key={p.id} variants={scaleIn}>
                <Cart {...p} url={p.image} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FULL-BLEED EDITORIAL BANNER — CHANDERI SILK
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-container py-6 sm:py-10">
        <ParallaxBanner img={image1}>
          <div
            className="relative h-[42vh] sm:h-[55vh] min-h-[260px] sm:min-h-[380px] flex items-end p-6 sm:p-10 md:p-16"
            style={{ background: 'linear-gradient(to top, rgba(10,5,0,0.8) 0%, rgba(10,5,0,0.2) 60%, transparent 100%)' }}
          >
            <div className="max-w-xl">
              <span className="label-overline text-white/50 mb-3">Narmada Weaves</span>
              <h3
                className="font-display font-black text-white leading-tight mb-4"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 4rem)' }}
              >
                Chanderi &amp; Maheshwari Silk
              </h3>
              <p className="text-white/65 text-sm mb-5 sm:mb-7 leading-relaxed max-w-md hidden sm:block">
                Woven on the banks of the Narmada for 300+ years. These GI-tagged silks carry the legacy of queens and craftswomen alike.
              </p>
              <Link to="/products/silk-textiles" className="btn-primary text-sm px-6 sm:px-8 py-3 sm:py-3.5">
                Shop Silk & Textiles <i className="ri-arrow-right-line" />
              </Link>
            </div>
          </div>
        </ParallaxBanner>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ARTISAN BENTO — EDITORIAL SPOTLIGHT
      ═══════════════════════════════════════════════════════════ */}
<section
  className="py-14 sm:py-24 relative overflow-hidden"
  style={{ background: 'linear-gradient(135deg, #1A1209 0%, #1B6B3A 70%, #0F4A27 100%)' }}
>
  {/* Background Gond pattern */}
  <div className="absolute inset-0 opacity-5 pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='50' fill='none' stroke='%23E8650A' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='25' fill='none' stroke='%23E8650A' stroke-width='0.5'/%3E%3Ccircle cx='60' cy='60' r='6' fill='%23E8650A'/%3E%3C/svg%3E")`,
    }}
  />

  <div className="section-container relative z-10">
    <Reveal>
      <EditorialHeading
        overline="Artisan Spotlight"
        title="Meet the Makers"
        sub="Every product carries a human story. These are the hands and hearts behind Narmavya."
        light
      />
    </Reveal>

    {/* Bento Grid — 3-col asymmetric */}
    <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Large feature card */}
      <Reveal className="md:col-span-2 md:row-span-1" delay={0.1}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-3xl h-80 sm:h-96 cursor-pointer group"
        >
          <img
            src={artisans[0].image}
            alt={artisans[0].name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)' }} />
          <div className="absolute bottom-0 left-0 p-8">
            <span className="badge badge-saffron mb-3 block w-fit">{artisans[0].craft}</span>
            <h3 className="font-display font-black text-white text-2xl sm:text-3xl mb-1">{artisans[0].name}</h3>
            <p className="text-white/60 text-xs flex items-center gap-1.5 mb-3">
              <i className="ri-map-pin-line" />{artisans[0].location}
            </p>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm hidden sm:block">{artisans[0].story}</p>
          </div>
        </motion.div>
      </Reveal>

      {/* Stat card */}
      <Reveal delay={0.2}>
        <div
          className="rounded-3xl p-8 flex flex-col justify-between h-full min-h-[200px]"
          style={{ background: 'rgba(232,101,10,0.12)', border: '1px solid rgba(232,101,10,0.2)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-[#E8650A]"></div>
            <span className="text-sm tracking-widest text-white/60 uppercase">
              Crafting Impact
            </span>
            <div className="w-8 h-[2px] bg-[#E8650A]"></div>
          </div>
          

          <div className="space-y-4 mt-4">
            {[
              { num: '100+', label: 'Authentic MP Products' },
              { num: '12+', label: 'Districts Covered' },
              { num: '100%', label: 'GI Verified' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                
                <span className="font-display font-black text-5xl"
                  style={{
                    background: 'linear-gradient(135deg, #E8650A, #D4A017)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                  {s.num}
                </span>

                <span className="text-white/60 text-sm text-right max-w-[140px]">
                  {s.label}
                </span>

              </div>
            ))}
          </div>
          <div className="text-white/50 text-white">
            Every number is a livelihood sustained.
          </div>
        </div>
        
      </Reveal>

      {/* Small artisan cards */}
      {artisans.slice(1).map((a, idx) => (
        <Reveal key={a.id} delay={0.15 + idx * 0.1}>
          <motion.div
            whileHover={{ y: -6 }}
            className="glass rounded-3xl p-6 flex items-start gap-4 cursor-pointer h-full"
          >
            <img
              src={a.image}
              alt={a.name}
              className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2"
              style={{ ringColor: '#E8650A' }}
            />
            <div className="min-w-0">
              <span className="badge badge-saffron mb-2 inline-block">{a.craft}</span>
              <h4 className="font-bold text-white text-base truncate">{a.name}</h4>
              <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5 mb-2">
                <i className="ri-map-pin-line" />{a.location}
              </p>
              <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{a.story}</p>
            </div>
          </motion.div>
        </Reveal>
      ))}

      {/* Philosophy Text Block (Fills the 2-column gap next to the 4th artisan card) */}
      <Reveal className="md:col-span-2 h-full" delay={0.5}>
        <div 
          className="rounded-3xl p-6 sm:p-8 flex flex-col justify-center h-full" 
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <h4 className="font-display font-bold text-lg text-white mb-3 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#E8650A] inline-block"></span>
            Where Heritage Finds You
          </h4>
          <p className="text-white/70 text-sm leading-relaxed">
            Long before these products reached your screen, they lived in the hands of artisans — shaped by patience, culture, and generations of quiet mastery.

This is not mass production. This is memory, skill, and identity woven into every detail.

At Narmavya, we don’t just showcase crafts — we reconnect them with the world.

Because when you choose handmade, you don’t just own an object —
you carry forward a legacy.
          </p>
        </div>
      </Reveal>
    </div>
  </div>
</section>
      

      {/* ═══════════════════════════════════════════════════════════
          ORGANIC PICKS — SPLIT LAYOUT
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-container py-12 sm:py-20">
        <Reveal className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-10 sm:mb-14">
          <EditorialHeading
            overline="Farm to Table"
            title="Organic Picks from MP"
            sub="Wild-harvested, stone-ground, zero-chemical. From Vindhya forests to your doorstep."
            center={false}
          />
          <Link to="/products/organic-food" className="btn-ghost whitespace-nowrap flex-shrink-0 text-sm">
            View All <i className="ri-arrow-right-line" />
          </Link>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {organic.map((p) => (
            <motion.div key={p.id} variants={scaleIn}>
              <Cart {...p} url={p.image} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DOUBLE PROMO BANNERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="section-container pb-6 sm:pb-10">
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                img:     '/artisan/002.png',
                tag:     'Heritage Craft',
                title:   'Bagh Block Printing',
                sub:     '1,200-year-old natural dye craft from Dhar',
                link:    '/products/handicrafts',
                overlay: 'linear-gradient(to top, rgba(3, 2, 0, 0.85), rgba(62,27,0,0.2))',
              },
              {
                img:     '/artisan/003.png',
                tag:     'Tribal Culture',
                title:   'Dhokra & Tribal Art',
                sub:     '2,000-year-old lost-wax metal casting',
                link:    '/products/tribal-art',
                overlay: 'linear-gradient(to top, rgba(15,74,39,0.85), rgba(15,74,39,0.2))',
              },
            ].map((b) => (
              <Link key={b.title} to={b.link}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                className="relative h-[220px] sm:h-[260px] rounded-3xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={b.img}
                    alt={b.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: b.overlay }} />
                  <div className="absolute bottom-0 left-0 p-5 sm:p-8">
                    <span className="badge badge-saffron mb-2 sm:mb-3 block w-fit">{b.tag}</span>
                    <h3 className="font-display font-black text-white text-xl sm:text-2xl mb-1">{b.title}</h3>
                    <p className="text-white/60 text-sm hidden sm:block">{b.sub}</p>
                  </div>
                  <div className="absolute top-5 right-5 w-10 h-10 glass rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <i className="ri-arrow-right-up-line" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HANDICRAFTS ROW — EDITORIAL 3-ACROSS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" style={{ background: '#fff' }}>
        <div className="section-container">
          <Reveal className="flex flex-col sm:flex-row items-end justify-between gap-4 mb-10 sm:mb-14">
            <EditorialHeading
              overline="Master Artistry"
              title="Handicrafts of MP"
              sub="Stone, brass, clay, wood — shaped by hands that have known no other craft for generations."
              center={false}
            />
            <Link to="/products/handicrafts" className="btn-ghost whitespace-nowrap flex-shrink-0 text-sm">
              View All <i className="ri-arrow-right-line" />
            </Link>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {handicrafts.map((p) => (
              <motion.div key={p.id} variants={scaleIn}>
                <Cart {...p} url={p.image} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS — EDITORIAL CARDS (MARQUEE LOOP)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 gond-texture overflow-hidden">
        <div className="section-container mb-12">
          <Reveal>
            <EditorialHeading
              overline="Customer Love"
              title="Voices from Across India"
              sub="Real reviews from customers who've experienced the soul of MP in their homes."
            />
          </Reveal>
        </div>

        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee flex gap-5 whitespace-nowrap py-4 px-5">
            {/* Array duplicated to create a seamless infinite loop */}
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div 
                key={`${t.id || idx}-${idx}`} 
                className="testimonial-card w-[320px] shrink-0 flex flex-col h-full whitespace-normal"
              >
                <div className="flex gap-0.5 stars mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-sm" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2"
                    style={{ outlineColor: '#E8650A' }}
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(calc(-50% - 10px)); } /* 10px accounts for half the gap */
          }
          .animate-marquee {
            animation: marquee 35s linear infinite;
            /* Optional: width needs to be wide enough to hold all items. 
              Using flex allows natural expansion. */
          }
          .group:hover .animate-marquee {
            animation-play-state: paused;
          }
        `}} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CULTURE BLOG — THREE EDITORIAL CARDS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="section-container">
          <Reveal>
            <EditorialHeading
              overline="Stories from MP"
              title="Culture & Craft"
              sub="Dispatches from the living heritage of Madhya Pradesh."
            />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'The 1,200-Year Secret of Bagh Block Printing',
                date:  'April 15, 2026',
                img:   '/artisan/bagh.jpeg',
                tag:   'Handicrafts',
                read:  '6 min read',
              },
              {
                title: 'How Gond Art Conquered International Galleries',
                date:  'April 10, 2026',
                img:   '/artisan/gond1.jpeg',
                tag:   'Tribal Art',
                read:  '8 min read',
              },
              {
                title: "Why Sehore Wheat Is Every Chef's Secret",
                date:  'April 5, 2026',
                img:   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
                tag:   'Organic',
                read:  '5 min read',
              },
            ].map((post, idx) => (
              <Reveal key={post.title} delay={idx * 0.1}>
                <motion.article
                  whileHover={{ y: -6 }}
                  className="bento-cell overflow-hidden group cursor-pointer"
                >
                  <div className="h-52 overflow-hidden">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge badge-ivory">{post.tag}</span>
                      <span className="text-[10px] text-gray-400">{post.read}</span>
                    </div>
                    <h4 className="font-display font-bold text-gray-900 text-base leading-snug mb-2">{post.title}</h4>
                    <p className="text-xs text-gray-400">{post.date}</p>
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NEWSLETTER — FULL-BLEED SAFFRON
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-14 sm:py-24 px-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #E8650A 0%, #C4500A 60%, #3E1B00 100%)' }}>
        <div className="absolute inset-0 bagh-stripe opacity-10 pointer-events-none" />
        <Reveal className="relative z-10 max-w-2xl mx-auto text-center text-white">
          <div className="label-overline justify-center text-white/50 mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Stay Connected
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Stories. Crafts. Seasons.
          </h2>
          <p className="text-white/70 mb-8 text-sm leading-relaxed">
            Get exclusive deals, new artisan stories &amp; seasonal picks — curated every fortnight.
          </p>
          <form
            className="flex flex-col gap-3 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              e.target.reset();
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 px-5 py-3.5 rounded-full bg-white/15 border border-white/25 text-white placeholder:text-white/40 outline-none text-sm backdrop-blur-sm focus:bg-white/20 transition-colors"
            />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-full bg-white font-bold text-sm transition-all hover:bg-gray-50"
              style={{ color: '#E8650A' }}
            >
              Subscribe Free
            </button>
          </form>
          <p className="text-white/35 text-xs mt-4">No spam. Unsubscribe anytime. Pinky promise 🤙</p>
        </Reveal>
      </section>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={2500} />
    </div>
  );
};

export default Home;