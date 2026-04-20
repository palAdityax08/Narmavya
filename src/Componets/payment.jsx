import React, { useEffect, useState, useRef } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const STEPS = ['Cart', 'Address', 'Payment', 'Done'];

const Payment = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const receiptRef = useRef();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) { setUser(u); setProducts(u.products || []); }
  }, []);

  const totalPrice = () =>
    Math.ceil(products.reduce((acc, p) => acc + p.price * (p.quantity || 1), 0));

  const delivery = totalPrice() >= 499 ? 0 : 60;
  const grandTotal = totalPrice() + delivery;

  const generatePDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { useCORS: true, backgroundColor: '#fff', scale: 2 }).then((canvas) => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`Narmavya-Receipt-${Date.now().toString().slice(-6)}.pdf`);
    });
  };

  const payHandler = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    generatePDF();

    // ── Save order to user profile ────────────────────────────────
    const orderId = 'NRM' + Date.now().toString().slice(-8).toUpperCase();
    const savedAddress = JSON.parse(sessionStorage.getItem('delivery_address') || 'null');
    const newOrder = {
      orderId,
      date: new Date().toISOString(),
      items: products.map(p => ({
        id: p.id, title: p.title, price: p.price,
        url: p.url, quantity: p.quantity || 1, origin: p.origin,
      })),
      address: savedAddress || {},
      subtotal: totalPrice(),
      delivery,
      grandTotal,
      paymentMethod: method,
      status: 'confirmed',
    };
    const existingOrders = user.orders || [];
    const updatedUser = { ...user, products: [], orders: [newOrder, ...existingOrders] };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // ──────────────────────────────────────────────────────────────

    setProcessing(false);
    setDone(true);
    toast.success('🎉 Order placed! Thank you for supporting MP artisans!');
    setTimeout(() => navigate('/orders'), 3500);
  };

  const methods = [
    { id: 'upi',  label: 'UPI / QR Code',       icon: 'ri-qr-code-line',             sub: 'PhonePe, GPay, Paytm' },
    { id: 'card', label: 'Credit / Debit Card',  icon: 'ri-bank-card-line',           sub: 'Visa, Mastercard, RuPay' },
    { id: 'cod',  label: 'Cash on Delivery',     icon: 'ri-money-rupee-circle-line',  sub: 'Pay when delivered' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture flex flex-col">
      <Nav />

      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4">

          {/* ─── Step Indicator ──────────────────────────────── */}
          <motion.div
            className="flex items-center justify-center gap-0 mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 ${i <= 2 ? 'text-[#E8650A]' : 'text-gray-300'}`}>
                  <motion.div
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      i < 2 ? 'bg-green-500 text-white shadow-green-200'
                      : i === 2 ? 'bg-[#E8650A] text-white shadow-orange-200'
                      : done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < 2 ? <i className="ri-check-line" /> : done && i === 3 ? <i className="ri-check-line" /> : i + 1}
                  </motion.div>
                  <span className={`text-xs font-semibold hidden sm:block ${i <= 2 ? '' : 'text-gray-300'}`}>{step}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 sm:w-20 mx-2 rounded-full transition-all duration-700 ${i < 2 ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* ─── Success State ────────────────────────────────── */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6"
                  style={{ background: 'rgba(27,107,58,0.08)' }}
                >
                  🎉
                </motion.div>
                <h2 className="font-display font-black text-gray-900 text-4xl mb-3">Order Confirmed!</h2>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-2">
                  Your authentic MP products are being prepared by our artisans.
                </p>
                <p className="text-gray-400 text-xs mb-6">Your PDF receipt has been downloaded. Redirecting to your orders…</p>
                <button onClick={() => navigate('/orders')}
                  className="px-8 py-3 rounded-full font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}>
                  Track My Order →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Payment UI ───────────────────────────────────── */}
          {!done && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Payment Method column */}
              <motion.div
                className="lg:col-span-3 space-y-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                <div className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_16px_60px_rgba(0,0,0,0.08)] border border-white p-8 relative overflow-hidden">
                  {/* Blob */}
                  <div
                    className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"
                    style={{ background: 'rgba(232,101,10,0.06)' }}
                  />
                  <div className="relative z-10">
                    <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-1">Step 3 of 3</p>
                    <h2 className="font-display font-black text-gray-900 text-2xl mb-6">
                      Select Payment Method
                    </h2>

                    <div className="space-y-3">
                      {methods.map((m, i) => (
                        <motion.label
                          key={m.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            method === m.id
                              ? 'border-[#E8650A] bg-orange-50/60'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="method"
                            value={m.id}
                            checked={method === m.id}
                            onChange={() => setMethod(m.id)}
                            className="accent-[#E8650A]"
                          />
                          <i className={`${m.icon} text-2xl ${method === m.id ? 'text-[#E8650A]' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                            <p className="text-xs text-gray-400">{m.sub}</p>
                          </div>
                          {method === m.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: '#E8650A' }}
                            >
                              <i className="ri-check-line text-white text-xs" />
                            </motion.div>
                          )}
                        </motion.label>
                      ))}
                    </div>

                    {/* Method-specific panels */}
                    <AnimatePresence mode="wait">
                      {method === 'upi' && (
                        <motion.div
                          key="upi"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 text-center"
                        >
                          <div
                            className="inline-block p-4 rounded-2xl shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #1B6B3A, #0F4A27)' }}
                          >
                            <div className="w-40 h-40 bg-white rounded-xl flex flex-col items-center justify-center shadow-inner">
                              <i className="ri-qr-code-line text-5xl text-gray-800" />
                              <p className="text-[10px] text-gray-500 mt-2 font-medium">narmavya@upi</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-4">Scan with any UPI app to pay</p>
                          <p className="font-black text-[#E8650A] text-xl mt-1">₹{grandTotal.toLocaleString()}</p>
                        </motion.div>
                      )}
                      {method === 'card' && (
                        <motion.div
                          key="card"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 space-y-3"
                        >
                          <input placeholder="Card Number (16 digits)" className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-all" />
                          <div className="grid grid-cols-2 gap-3">
                            <input placeholder="MM / YY" className="px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-all" />
                            <input placeholder="CVV" className="px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-all" />
                          </div>
                          <input placeholder="Name on Card" className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-all" />
                        </motion.div>
                      )}
                      {method === 'cod' && (
                        <motion.div
                          key="cod"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3"
                        >
                          <i className="ri-information-line text-amber-600 text-xl flex-shrink-0" />
                          <p className="text-amber-700 text-sm leading-relaxed">
                            Pay <strong>₹{grandTotal.toLocaleString()}</strong> in cash when your order is delivered.
                            COD available for all MP districts.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Order Summary column */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <div className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_16px_60px_rgba(0,0,0,0.08)] border border-white sticky top-32">
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-5">Order Summary</h3>

                  {/* Product list */}
                  <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                    {products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">Qty: {p.quantity || 1}</p>
                        </div>
                        <span className="text-xs font-bold" style={{ color: '#E8650A' }}>
                          ₹{(p.price * (p.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold">₹{totalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery</span>
                      <span className={`font-semibold ${delivery === 0 ? 'text-green-600' : ''}`}>
                        {delivery === 0 ? 'FREE' : `₹${delivery}`}
                      </span>
                    </div>
                    {delivery > 0 && (
                      <p className="text-xs text-[#E8650A] bg-orange-50 rounded-xl px-3 py-2">
                        Add ₹{499 - totalPrice()} more for free delivery!
                      </p>
                    )}
                    <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-lg">
                      <span>Grand Total</span>
                      <span style={{ color: '#E8650A' }}>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Pay CTA */}
                  <motion.button
                    onClick={payHandler}
                    disabled={processing}
                    whileHover={!processing ? { y: -2, boxShadow: '0 16px 40px rgba(27,107,58,0.45)' } : {}}
                    whileTap={!processing ? { scale: 0.98 } : {}}
                    className="w-full mt-6 py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: processing ? '#aaa' : 'linear-gradient(135deg, #1B6B3A, #0F4A27)',
                      boxShadow: processing ? 'none' : '0 8px 25px rgba(27,107,58,0.35)',
                    }}
                  >
                    {processing ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        />
                        Processing payment…
                      </>
                    ) : (
                      <>
                        <i className="ri-shield-check-line" />
                        Confirm & Pay ₹{grandTotal.toLocaleString()}
                      </>
                    )}
                  </motion.button>

                  {/* Trust signals */}
                  <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-gray-100">
                    {['🔒 256-bit SSL Encrypted', '📄 PDF Receipt Generated', '🏺 Authentic MP Products'].map((t) => (
                      <p key={t} className="text-xs text-gray-400 flex items-center gap-1">{t}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Hidden PDF Receipt ───────────────────────────────── */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div ref={receiptRef} className="p-8 max-w-lg bg-white text-black font-sans text-sm" style={{ width: '600px' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black" style={{ color: '#E8650A' }}>Narmavya</h1>
              <p className="text-gray-500 text-xs">The Soul of Madhya Pradesh</p>
              <p className="text-gray-400 text-xs">Bhopal, MP 462001 | hello@narmavya.in</p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p><strong>Invoice #:</strong> {Date.now().toString().slice(-6)}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
              <p><strong>Customer:</strong> {user?.name || 'Guest'}</p>
            </div>
          </div>
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr style={{ background: '#E8650A', color: 'white' }}>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td className="p-2">{p.title}</td>
                  <td className="p-2 text-center">{p.quantity || 1}</td>
                  <td className="p-2 text-right">₹{p.price}</td>
                  <td className="p-2 text-right">₹{p.price * (p.quantity || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right text-sm space-y-1">
            <p>Subtotal: ₹{totalPrice()}</p>
            <p>Delivery: {delivery === 0 ? 'FREE' : `₹${delivery}`}</p>
            <p className="font-black text-lg" style={{ color: '#E8650A' }}>Grand Total: ₹{grandTotal}</p>
          </div>
          <div className="mt-6 text-center text-gray-400 text-xs pt-4 border-t">
            <p>Thank you for supporting MP artisans! 🌿 www.narmavya.in</p>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
    </div>
  );
};

export default Payment;
