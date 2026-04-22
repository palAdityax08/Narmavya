import React, { useRef } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { artisans } from '../data/mpProducts';

const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const BentoCard = ({ children, className = '', img, delay = 0, color = 'bg-white' }) => (
  <Reveal delay={delay} className={`relative overflow-hidden rounded-[2.5rem] group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 ${color} ${className}`}>
    {img && (
      <>
        <div className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-500 group-hover:bg-black/40" />
        <img
          src={img}
          alt="Bento visual"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </>
    )}
    <div className="relative z-20 h-full p-8 md:p-10 flex flex-col justify-end">
      {children}
    </div>
  </Reveal>
);

const About = () => {
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white pb-20">
      <Nav />

      {/* Cinematic Hero */}
      <header
        ref={headerRef}
        className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        <motion.div className="absolute inset-0 z-0" style={{ y }}>
          <img
            src="/artisan/f3.jpeg"
            alt="Madhya Pradesh Heritage"
            className="b-full h-full object-cover scale-110"
          />
        </motion.div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/90 via-black/60 to-[#FDF6EC]" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mt-0">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#E8650A] tracking-[0.3em] uppercase text-xs font-bold mb-6 drop-shadow-md"
          >
            The Heart of India
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-[1.1] mb-6 sm:mb-8 font-display drop-shadow-2xl"
            style={{ 
              textShadow: '0 10px 40px rgba(0, 0, 0, 0)',
              letterSpacing: '-0.02em'
            }}
          >
            The Soul of <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E8650A] to-[#D4A017]">
              Madhya Pradesh
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-white/80 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto hidden sm:block"
          >
            Preserving centuries of artistry, honoring the hands that weave magic, and bringing genuine MP heritage to the world.
          </motion.p>
        </div>
      </header>

      {/* The Bento Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-16 sm:-mt-32 relative z-30">
        
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-[minmax(300px,_auto)_minmax(300px,_auto)_minmax(300px,_auto)] gap-6">
          
          {/* Bento Item 1: Mission Large */}
          <BentoCard className="md:col-span-2 md:row-span-2" color="bg-white/80 backdrop-blur-3xl">
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full border border-[#E8650A]/20 flex items-center justify-center opacity-50">
              <span className="text-[#E8650A] font-bold tracking-widest text-xs rotate-[-15deg]">Narmavya</span>
            </div>
            <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-6">Our Mission</p>
            <h2 className="text-4xl md:text-5xl font-black font-display text-gray-900 leading-tight mb-8">
              Empowering the <br /> Artisan Ecosystem
            </h2>
            <p className="text-gray-600 text-lg font-light leading-relaxed mb-10 max-w-lg">
              Madhya Pradesh hosts some of India's most extraordinary craft traditions. Yet, pure authenticity is rare. We bridge the gap directly between you and the GI-tagged cooperatives of the state, ensuring fair trade and zero middlemen.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-auto">
              <div>
                <p className="text-4xl font-black text-[#E8650A] mb-1 font-display">70%+</p>
                <p className="text-gray-500 text-sm font-medium">Revenue straight to artisans</p>
              </div>
              <div>
                <p className="text-4xl font-black text-[#1B6B3A] mb-1 font-display">100%</p>
                <p className="text-gray-500 text-sm font-medium">GI Authenticated crafts</p>
              </div>
            </div>
          </BentoCard>

          {/* Bento Item 2: Image Focus - Gond Art */}
          <BentoCard 
            className="md:col-span-1 md:row-span-2"
            img="/artisan/gond2.png"
            delay={0.1}
          >
            <div className="text-white">
              <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wide">
                Gond Art
              </span>
              <h3 className="text-2xl font-display font-bold mt-4 mb-2">Tribal Canvas</h3>
              <p className="text-white/80 text-sm font-light leading-relaxed">
                Celebrating nature and mythos through the pointillism of the Gond tribe from Mandla.
              </p>
            </div>
          </BentoCard>

          {/* Bento Item 3: Quick Fact */}
          <BentoCard className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-[#1B6B3A] to-[#0F4A27]" delay={0.2}>
            <div className="text-white h-full flex flex-col justify-between">
               <i className="ri-leaf-line text-4xl text-[#E8650A]" />
               <div>
                 <h3 className="text-2xl font-display font-bold mb-2">Sustainable <br/> Sourcing</h3>
                 <p className="text-white/70 text-sm font-light">Natural dyes, forest-foraged herbs, and eco-friendly packaging.</p>
               </div>
            </div>
          </BentoCard>

          {/* Bento Item 4: Silk focus */}
          <BentoCard 
            className="md:col-span-1 md:row-span-2"
            img="/artisan/chanderi.png" 
            delay={0.3}
          >
            <div className="text-white">
              <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wide">
                Chanderi
              </span>
              <h3 className="text-2xl font-display font-bold mt-4 mb-2">The Royal Weave</h3>
              <p className="text-white/80 text-sm font-light leading-relaxed">
                Sheer texture, light weight and shimmering zari from the looms of Ashoknagar.
              </p>
            </div>
          </BentoCard>

          {/* Bento Item 5: Artisan Spotlights Slider */}
          <BentoCard className="md:col-span-3 md:row-span-1 bg-white" delay={0.4}>
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="md:w-1/3">
                <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-3">The Makers</p>
                <h3 className="text-3xl font-display font-black text-gray-900 mb-4">Hands Behind the Magic</h3>
                <p className="text-gray-500 text-sm font-light mb-6">
                  Meet the master craftsmen ensuring the survival of centuries-old techniques.
                </p>
                <Link to="/products" className="btn-primary py-3 px-6 text-sm">
                  Support Their Craft
                </Link>
              </div>
              
              <div className="md:w-2/3 flex gap-4 w-full overflow-x-auto scrollbar-hide py-2 pr-4">
                {artisans.map(a => (
                  <div key={a.id} className="min-w-[240px] flex-shrink-0 group cursor-pointer">
                    <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                       <img src={a.image} alt={a.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <p className="text-[10px] font-bold text-[#E8650A] uppercase tracking-wider mb-1">{a.craft}</p>
                    <p className="text-gray-900 font-bold mb-0.5">{a.name}</p>
                    <p className="text-gray-400 text-xs"><i className="ri-map-pin-line mr-1" />{a.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

        </div>

        {/* Closing Heritage Banner */}
        <Reveal delay={0.3} className="mt-6 md:mt-20">
          <div className="rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden relative flex items-center justify-center py-16 sm:py-32 px-6 sm:px-10 text-center"
               style={{ background: 'linear-gradient(135deg, #3E1B00 0%, #1B6B3A 100%)' }}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')]" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <i className="ri-map-pin-user-line text-5xl text-[#D4A017] mb-6 block" />
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">
                Ready to Experience <br/> MP's Finest?
              </h2>
              <p className="text-white/80 text-lg font-light mb-10">
                Explore our curated collection of authentic, hand-picked crafts, textiles, and organic spices.
              </p>
              <Link to="/products" className="bg-white text-gray-900 hover:bg-[#FDF6EC] font-bold px-10 py-5 rounded-full transition-all duration-300 shadow-[0_10px_40px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_50px_rgba(255,255,255,0.3)] hover:-translate-y-1 inline-block">
                Enter the Marketplace →
              </Link>
            </div>
          </div>
        </Reveal>

      </main>

      <Footer />
    </div>
  );
};

export default About;
