import React, { useState, useEffect } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const STEPS = ['Cart', 'Address', 'Payment', 'Done'];

/* ─── Animated Input Field ────────────────────────────────────── */
const InputField = ({ label, name, type = 'text', placeholder, required = false, disabled = false, value, onChange, colSpan = '' }) => (
  <motion.div
    className={`flex flex-col gap-1.5 ${colSpan}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-[#E8650A]">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className="px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500 hover:border-gray-300"
    />
  </motion.div>
);

const Detail = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', pincode: '', locality: '',
    address: '', city: '', state: 'Madhya Pradesh', landmark: '', altphone: '',
  });

  // Pre-fill from: (1) saved default address, (2) last used address, (3) empty
  useEffect(() => {
    // Layer 1: last address used in this session (most recent checkout)
    const lastUsed = JSON.parse(sessionStorage.getItem('delivery_address') || 'null');
    if (lastUsed?.name) {
      setForm(prev => ({ ...prev, ...lastUsed }));
      return;
    }
    // Layer 2: saved address from user profile in localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const addresses = user.addresses || [];
    const def = addresses.find(a => a.isDefault) || addresses[0];
    if (def) setForm(prev => ({ ...prev, ...def }));
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ['name', 'phone', 'pincode', 'locality', 'address', 'city', 'state'];
    for (const f of required) {
      if (!form[f].trim()) { toast.error(`Please fill in ${f.charAt(0).toUpperCase() + f.slice(1)}`); return; }
    }
    if (form.phone.length < 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
    // Save address for order record
    sessionStorage.setItem('delivery_address', JSON.stringify(form));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture flex flex-col">
      <Nav />

      <main className="flex-grow pt-20 sm:pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          {/* ─── Step Indicator ──────────────────────────────── */}
          <motion.div
            className="flex items-center justify-center gap-0 mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 ${i <= 1 ? 'text-[#E8650A]' : 'text-gray-300'}`}>
                  <motion.div
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      i < 1 ? 'bg-green-500 text-white shadow-green-200'
                      : i === 1 ? 'bg-[#E8650A] text-white shadow-orange-200'
                      : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < 1 ? <i className="ri-check-line" /> : i + 1}
                  </motion.div>
                  <span className={`text-xs font-semibold hidden sm:block ${i <= 1 ? '' : 'text-gray-300'}`}>{step}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-20 mx-2 rounded-full transition-all duration-700 ${i < 1 ? 'bg-green-400' : 'bg-gray-200'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* ─── Glassmorphism Form Card ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_16px_60px_rgba(0,0,0,0.08)] border border-white p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Ambient blobs */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"
              style={{ background: 'rgba(232,101,10,0.06)' }}
            />
            <div
              className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"
              style={{ background: 'rgba(27,107,58,0.05)' }}
            />

            <div className="relative z-10">
              <div className="mb-7">
                <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-1">Step 2 of 3</p>
                <h2 className="font-display font-black text-gray-900 text-3xl mb-1">
                  Delivery Address
                </h2>
                <p className="text-gray-500 text-sm">Where should we deliver your authentic MP products?</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Name" name="name" placeholder="As on ID" required value={form.name} onChange={handleChange} />
                  <InputField label="Phone Number" name="phone" type="tel" placeholder="10-digit mobile" required value={form.phone} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Pincode" name="pincode" placeholder="6-digit pincode" required value={form.pincode} onChange={handleChange} />
                  <InputField label="Locality / Area" name="locality" placeholder="Colony, locality" required value={form.locality} onChange={handleChange} />
                </div>

                <motion.div
                  className="flex flex-col gap-1.5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <label className="text-sm font-semibold text-gray-700">
                    Full Address <span className="text-[#E8650A]">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House/Flat No., Street, Area..."
                    rows={3}
                    required
                    className="px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm resize-none transition-all hover:border-gray-300"
                  />
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="City / District" name="city" placeholder="Bhopal, Indore, Jabalpur..." required value={form.city} onChange={handleChange} />
                  <InputField label="State" name="state" placeholder="State" required value={form.state} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Landmark (Optional)" name="landmark" placeholder="Near school, temple..." value={form.landmark} onChange={handleChange} />
                  <InputField label="Alternate Phone" name="altphone" type="tel" placeholder="Optional alternate number" value={form.altphone} onChange={handleChange} />
                </div>

                {/* Delivery Info Banner */}
                <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                  <i className="ri-truck-line text-green-600 text-2xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-700 font-semibold text-sm">Estimated Delivery: 5–7 Business Days</p>
                    <p className="text-green-600 text-xs mt-0.5 leading-relaxed">
                      Free delivery included for orders ≥ ₹499 · Shipped from artisan workshops across MP
                    </p>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ y: -2, boxShadow: '0 16px 40px rgba(232,101,10,0.45)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)', boxShadow: '0 8px 25px rgba(232,101,10,0.35)' }}
                >
                  Continue to Payment
                  <i className="ri-arrow-right-line" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
    </div>
  );
};

export default Detail;