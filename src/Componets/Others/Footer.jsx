import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const categories = [
    { label: 'Handicrafts', to: '/products/handicrafts' },
    { label: 'Silk & Textiles', to: '/products/silk-textiles' },
    { label: 'Spices & Herbs', to: '/products/organic-spices' },
    { label: 'Tribal Art', to: '/products/tribal-art' },
    { label: 'Organic Food', to: '/products/organic-food' },
    { label: 'Jewelry', to: '/products/jewelry' },
  ];
  const quicklinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'About MP', to: '/about' },
    { label: 'Wishlist', to: '/wishlist' },
    { label: 'Cart', to: '/addToCart' },
    { label: 'Help & Support', to: '/Contact' },
  ];
  const socials = [
    { icon: 'ri-instagram-line', href: '#', color: '#E8650A' },
    { icon: 'ri-facebook-box-line', href: '#', color: '#1877F2' },
    { icon: 'ri-twitter-x-line', href: '#', color: '#000' },
    { icon: 'ri-youtube-line', href: '#', color: '#FF0000' },
    { icon: 'ri-whatsapp-line', href: '#', color: '#25D366' },
  ];

  return (
    <footer style={{ background: '#1A0A00' }}>
      {/* MP Decorative Border */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #E8650A, #D4A017, #1B6B3A, #D4A017, #E8650A)' }}
      />

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2
            className="text-3xl font-black mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: 'linear-gradient(135deg, #E8650A, #D4A017)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Narmavya
          </h2>
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4">The Soul of Madhya Pradesh</p>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            Connecting the world with authentic handcrafted products, organic produce, and tribal art from the heart of India — Madhya Pradesh.
          </p>
          {/* Social Icons */}
          <div className="flex gap-3">
            {socials.map((s, i) => (
              <motion.a
                key={i}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3, scale: 1.1 }}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all"
              >
                <i className={s.icon} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="w-5 h-0.5 inline-block" style={{ background: '#E8650A' }} />
            Quick Links
          </h4>
          <ul className="space-y-2.5">
            {quicklinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-white/55 hover:text-[#E8650A] text-sm transition-colors flex items-center gap-2"
                >
                  <i className="ri-arrow-right-s-line text-xs opacity-60" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="w-5 h-0.5 inline-block" style={{ background: '#E8650A' }} />
            Categories
          </h4>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.label}>
                <Link
                  to={c.to}
                  className="text-white/55 hover:text-[#E8650A] text-sm transition-colors flex items-center gap-2"
                >
                  <i className="ri-arrow-right-s-line text-xs opacity-60" />
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="w-5 h-0.5 inline-block" style={{ background: '#E8650A' }} />
            Contact Us
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <i className="ri-map-pin-line text-[#E8650A] mt-0.5 flex-shrink-0" />
              <span className="text-white/55 text-sm">Narmavya HQ, Bhopal, Madhya Pradesh 462001</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ri-phone-line text-[#E8650A] flex-shrink-0" />
              <a href="tel:+917555000100" className="text-white/55 text-sm hover:text-[#E8650A] transition-colors">+91 75550 00100</a>
            </li>
            <li className="flex items-center gap-3">
              <i className="ri-mail-line text-[#E8650A] flex-shrink-0" />
              <a href="mailto:hello@narmavya.in" className="text-white/55 text-sm hover:text-[#E8650A] transition-colors">hello@narmavya.in</a>
            </li>
            <li className="flex items-center gap-3">
              <i className="ri-time-line text-[#E8650A] flex-shrink-0" />
              <span className="text-white/55 text-sm">Mon–Sat, 9am–6pm IST</span>
            </li>
          </ul>

          {/* Trust Badges */}
          <div className="mt-5 flex flex-wrap gap-2">
            {['GI Tagged', '100% Organic', 'Artisan Made'].map((b) => (
              <span key={b} className="text-[10px] font-semibold px-2 py-1 rounded-full border border-[#E8650A]/40 text-[#E8650A]">
                ✓ {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t px-6 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/35 text-xs text-center">
            © {new Date().getFullYear()} Narmavya. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((t) => (
              <span key={t} className="text-white/30 hover:text-white/60 text-xs cursor-pointer transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
