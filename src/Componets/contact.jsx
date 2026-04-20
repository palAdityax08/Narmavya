import React, { useState, useRef } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ─── Animation helpers ───────────────────────────────────────── */
const Reveal = ({ children, className = '', delay = 0, y = 32 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ─── Contact Info Card ───────────────────────────────────────── */
const InfoCard = ({ icon, title, lines, color, delay }) => (
  <Reveal delay={delay}>
    <motion.div
      whileHover={{ y: -6 }}
      className="bento-cell p-6 flex items-start gap-5"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
      >
        <i className={icon} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
        {lines.map((l, i) => (
          <p key={i} className="text-gray-500 text-xs leading-relaxed">{l}</p>
        ))}
      </div>
    </motion.div>
  </Reveal>
);

/* ─── Main Component ──────────────────────────────────────────── */
const Contact = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: 'ri-map-pin-2-line',
      title: 'Visit Us',
      lines: ['Narmavya HQ, Hamidia Road', 'Bhopal, Madhya Pradesh 462001'],
      color: '#E8650A',
    },
    {
      icon: 'ri-phone-line',
      title: 'Call Us',
      lines: ['+91 75550 00100', 'Mon–Sat, 9am–6pm IST'],
      color: '#1B6B3A',
    },
    {
      icon: 'ri-mail-line',
      title: 'Email Us',
      lines: ['hello@narmavya.in', 'support@narmavya.in'],
      color: '#D4A017',
    },
    {
      icon: 'ri-whatsapp-line',
      title: 'WhatsApp',
      lines: ['+91 75550 00100', 'Quick replies within 1 hour'],
      color: '#25D366',
    },
  ];

  const subjects = [
    { value: '', label: 'Select a topic...' },
    { value: 'order', label: 'Order Inquiry' },
    { value: 'product', label: 'Product Question' },
    { value: 'artisan', label: 'Artisan Partnership' },
    { value: 'return', label: 'Return / Refund' },
    { value: 'wholesale', label: 'Wholesale / Bulk' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture">
      <Nav />

      {/* ─── Cinematic Page Hero ──────────────────────────────── */}
      <header
        className="relative overflow-hidden flex items-end"
        style={{ paddingTop: '96px', minHeight: '360px' }}
      >
        {/* BG image layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover scale-105"
          />
        </div>
        {/* Veil */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(135deg, rgba(62,27,0,0.92) 0%, rgba(27,107,58,0.75) 100%)' }}
        />
        <div className="absolute inset-0 z-10 bagh-stripe opacity-15 pointer-events-none" />

        {/* Content */}
        <motion.div
          className="relative z-20 section-container w-full pb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="label-overline text-white/40 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Get in Touch
          </div>
          <h1
            className="font-display font-black text-white leading-none mb-3"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.02em' }}
          >
            Help & Support
          </h1>
          <p className="text-white/55 text-sm max-w-lg leading-relaxed">
            We're always here for our MP artisan community and customers across India.
            Reach out — we speak English, Hindi and Malwi.
          </p>

          {/* Quick stat row */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: '<1 hr', sub: 'WhatsApp response' },
              { label: '24 hrs', sub: 'Email response' },
              { label: '6 days', sub: 'Mon–Sat support' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="font-display font-black text-2xl" style={{ color: '#E8650A' }}>{s.label}</span>
                <span className="text-white/40 text-xs">{s.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </header>

      {/* ─── Contact grid ─────────────────────────────────────── */}
      <main className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* LEFT — Info column */}
          <div className="lg:col-span-2 space-y-4">
            <Reveal>
              <div className="mb-6">
                <h2 className="font-display font-black text-gray-900 text-2xl mb-2">Let's Talk</h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                  Whether you have a question about your order, want to become an artisan partner,
                  or just want to know more about MP's heritage — we'd love to hear from you.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {contactInfo.map((c, i) => (
                <InfoCard key={c.title} {...c} delay={i * 0.07} />
              ))}
            </div>

            {/* Artisan Partner CTA */}
            <Reveal delay={0.35}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative rounded-3xl p-7 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1B6B3A, #0F4A27)' }}
              >
                <div className="absolute inset-0 bagh-stripe opacity-10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-3xl mb-3">🏺</div>
                  <h4 className="font-display font-black text-white text-lg mb-2">
                    Artisan Partner Program
                  </h4>
                  <p className="text-white/65 text-sm leading-relaxed mb-4">
                    Are you an MP artisan, cooperative or GI-tagged producer?
                    Join Narmavya and reach customers across India and globally.
                  </p>
                  <a
                    href="mailto:partners@narmavya.in"
                    className="inline-flex items-center gap-2 font-bold text-sm"
                    style={{ color: '#E8650A' }}
                  >
                    partners@narmavya.in
                    <i className="ri-arrow-right-line" />
                  </a>
                </div>
              </motion.div>
            </Reveal>
          </div>

          {/* RIGHT — Contact Form */}
          <div className="lg:col-span-3">
            <Reveal delay={0.1}>
              <div className="relative bg-white/85 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_12px_60px_rgba(0,0,0,0.07)] border border-white overflow-hidden">
                {/* Decorative blobs */}
                <div
                  className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
                  style={{ background: 'rgba(232,101,10,0.06)' }}
                />
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"
                  style={{ background: 'rgba(27,107,58,0.05)' }}
                />

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center justify-center text-center py-16 relative z-10"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
                        style={{ background: 'rgba(27,107,58,0.08)' }}
                      >
                        🌿
                      </motion.div>
                      <h3 className="font-display font-black text-gray-900 text-3xl mb-3">
                        Message Sent!
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
                        Thank you for reaching out, <strong>{form.firstName}</strong>.
                        Our team will respond within 24 hours. Namaste! 🙏
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' }); }}
                        className="btn-ghost text-sm px-8 py-3"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10"
                    >
                      <h3 className="font-display font-black text-gray-900 text-2xl mb-1">
                        Send Us a Message
                      </h3>
                      <p className="text-gray-500 text-sm mb-8">We typically respond within 24 hours.</p>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { name: 'firstName', label: 'First Name', placeholder: 'Priya', required: true },
                            { name: 'lastName', label: 'Last Name', placeholder: 'Sharma' },
                          ].map((f) => (
                            <div key={f.name}>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {f.label} {f.required && <span className="text-red-400">*</span>}
                              </label>
                              <input
                                name={f.name}
                                value={form[f.name]}
                                onChange={handleChange}
                                required={f.required}
                                placeholder={f.placeholder}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-colors"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="priya@email.com"
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-colors"
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                          <select
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-colors bg-white"
                          >
                            {subjects.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Message <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="How can we help you today?"
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-colors resize-none"
                          />
                        </div>

                        {/* Submit */}
                        <motion.button
                          type="submit"
                          disabled={sending}
                          whileHover={!sending ? { y: -2, boxShadow: '0 15px 40px rgba(232,101,10,0.45)' } : {}}
                          whileTap={!sending ? { scale: 0.98 } : {}}
                          className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                          style={{
                            background: sending
                              ? '#aaa'
                              : 'linear-gradient(135deg, #E8650A, #C4500A)',
                            boxShadow: '0 8px 25px rgba(232,101,10,0.35)',
                          }}
                        >
                          {sending ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              />
                              Sending…
                            </>
                          ) : (
                            <>
                              Send Message
                              <i className="ri-send-plane-line" />
                            </>
                          )}
                        </motion.button>

                        {/* Trust line */}
                        <p className="text-center text-gray-400 text-xs flex items-center justify-center gap-1.5">
                          <i className="ri-lock-line" />
                          Your data is safe & never shared with anyone.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ─── Bhopal Map ───────────────────────────────────────── */}
        <Reveal className="mt-16" delay={0.15}>
          <div className="rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 relative">
            <div className="absolute top-6 left-6 z-10 glass-ivory rounded-2xl px-5 py-3 shadow-sm">
              <p className="font-bold text-gray-900 text-sm">Narmavya HQ</p>
              <p className="text-gray-500 text-xs">Bhopal, Madhya Pradesh</p>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d232463.36990989677!2d77.23088339999999!3d23.2599333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8fd68fbd%3A0x2155716d572d4f8!2sBhopal%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin"
              className="w-full h-80 border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Narmavya HQ location"
            />
          </div>
        </Reveal>

        {/* ─── Bottom FAQ strip ─────────────────────────────────── */}
        <Reveal className="mt-14" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: 'ri-time-line',
                title: 'Response Time',
                text: 'Email: within 24 hours. WhatsApp: within 1 hour during business hours.',
                color: '#E8650A',
              },
              {
                icon: 'ri-hand-heart-line',
                title: 'Artisan Support',
                text: 'On-boarding calls available in English, Hindi, and Malwi for artisan partners.',
                color: '#1B6B3A',
              },
              {
                icon: 'ri-refresh-line',
                title: 'Returns & Refunds',
                text: 'Hassle-free 7-day return policy for all non-perishable products.',
                color: '#D4A017',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="bento-cell p-7"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
                  style={{ background: `${f.color}15`, color: f.color }}
                >
                  <i className={f.icon} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
    </div>
  );
};

export default Contact;
