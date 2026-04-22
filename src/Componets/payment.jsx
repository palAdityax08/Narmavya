import React, { useEffect, useState, useRef } from 'react';
import Nav from './nav';
import Footer from './Others/Footer';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useRazorpay from '../hooks/useRazorpay';
import api from '../utils/api';

const STEPS = ['Cart', 'Address', 'Payment', 'Done'];

// ── Step indicator (shared between detail.jsx and payment.jsx) ──────────────
const StepBar = ({ currentStep }) => (
  <motion.div
    className="flex items-center justify-center gap-0 mb-12"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    {STEPS.map((step, i) => (
      <React.Fragment key={step}>
        <div className={`flex items-center gap-2 ${i <= currentStep ? 'text-[#E8650A]' : 'text-gray-300'}`}>
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
              i < currentStep  ? 'bg-green-500 text-white shadow-green-200'
              : i === currentStep ? 'bg-[#E8650A] text-white shadow-orange-200'
              : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i < currentStep ? <i className="ri-check-line" /> : i + 1}
          </motion.div>
          <span className={`text-xs font-semibold hidden sm:block ${i <= currentStep ? '' : 'text-gray-300'}`}>{step}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-0.5 w-8 sm:w-20 mx-2 rounded-full transition-all duration-700 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </motion.div>
);

// ── Order receipt component ─────────────────────────────────────────────────
const Receipt = React.forwardRef(({ items, orderId, address, subtotal, delivery, grandTotal, paymentMethod, user }, ref) => (
  <div ref={ref} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
      <div>
        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>Narmavya</h2>
        <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">The Soul of Madhya Pradesh</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400">Order ID</p>
        <p className="font-mono font-bold text-[#E8650A]">#{orderId}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
      </div>
    </div>

    {/* Customer */}
    {address?.name && (
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deliver To</p>
        <p className="font-semibold text-gray-800">{address.name}</p>
        <p className="text-sm text-gray-500">{address.address}, {address.locality}</p>
        <p className="text-sm text-gray-500">{address.city}, {address.state} — {address.pincode}</p>
        {address.phone && <p className="text-sm text-gray-500">📞 {address.phone}</p>}
      </div>
    )}

    {/* Items */}
    <div className="mb-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
              <img src={p.url} alt={p.title} className="w-full h-full object-cover" onError={e=>e.target.src='https://via.placeholder.com/48'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
              {p.origin && <p className="text-xs text-gray-400">{p.origin}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black text-[#E8650A]">₹{(p.price * (p.quantity||1)).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Qty: {p.quantity||1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Totals */}
    <div className="border-t border-gray-100 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Subtotal</span>
        <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Delivery</span>
        <span className="text-green-600 font-semibold">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
      </div>
      <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-100">
        <span>Total Paid</span>
        <span className="text-[#E8650A]">₹{grandTotal.toLocaleString()}</span>
      </div>
      <p className="text-xs text-gray-400 pt-2">Payment via: <span className="font-semibold capitalize">{paymentMethod}</span></p>
    </div>

    {/* Footer */}
    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
      <p className="text-xs text-gray-400">Thank you for supporting Madhya Pradesh artisans 🌿</p>
      <p className="text-xs text-gray-300 mt-1">narmavya.in · support@narmavya.in</p>
    </div>
  </div>
));

// ── Main Payment Component ──────────────────────────────────────────────────
const Payment = () => {
  const navigate     = useNavigate();
  const openRazorpay = useRazorpay();
  const receiptRef   = useRef();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user: authUser } = useAuthStore();
  const [localUser, setLocalUser] = useState(null);
  const user = authUser || localUser;

  // ── Cart ──────────────────────────────────────────────────────────────────
  const items          = useCartStore((s) => s.items);
  const clearCart      = useCartStore((s) => s.clearCart);
  const totalPrice     = useCartStore((s) => s.totalPrice);
  const deliveryCharge = useCartStore((s) => s.deliveryCharge);
  const grandTotalFn   = useCartStore((s) => s.grandTotal);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [method,     setMethod]     = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  const [done,       setDone]       = useState(false);
  const [orderId,    setOrderId]    = useState('');
  const [backendUp,  setBackendUp]  = useState(true); // optimistic

  // ── Delivery address (set by detail.jsx → sessionStorage) ─────────────────
  const address = JSON.parse(sessionStorage.getItem('delivery_address') || 'null') || {};

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setLocalUser(u);
    // Probe backend health
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/health')
      .then(r => r.ok ? setBackendUp(true) : setBackendUp(false))
      .catch(() => setBackendUp(false));
  }, []);

  const subtotal    = totalPrice();
  const delivery    = deliveryCharge();
  const grandTotal  = grandTotalFn();

  // ── Download PDF ──────────────────────────────────────────────────────────
  const generatePDF = () => {
    const input = receiptRef.current;
    if (!input) return;
    html2canvas(input, { useCORS: true, backgroundColor: '#fff', scale: 2 }).then((canvas) => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w   = pdf.internal.pageSize.getWidth();
      const h   = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`Narmavya-Receipt-${Date.now().toString().slice(-6)}.pdf`);
    });
  };

  // ── Helper: save order to localStorage (works for ALL payment methods) ──────
  const saveOrderLocally = (oid, pm, itemsSnap) => {
    const orderItems = (itemsSnap || items).map(p => ({
      id: p.id, title: p.title, price: p.price,
      url: p.url, quantity: p.quantity || 1, origin: p.origin || '',
    }));
    const newOrder = {
      orderId: oid,
      date: new Date().toISOString(),
      items: orderItems,
      address,
      subtotal,
      delivery,
      grandTotal,
      paymentMethod: pm,
      status: 'Confirmed',
    };
    // Persist to localStorage user.orders
    const existing = JSON.parse(localStorage.getItem('user')) || {};
    localStorage.setItem('user', JSON.stringify({
      ...existing,
      orders: [newOrder, ...(existing.orders || [])],
    }));
    return newOrder;
  };

  // ── Helper: finalize order after payment ──────────────────────────────────
  const finalizeOrder = (oid, pm) => {
    // 1. Snapshot items BEFORE clearing cart (receipt needs them)
    const snapshot = items.map(p => ({ ...p }));
    sessionStorage.setItem('_lastItems', JSON.stringify(snapshot));
    sessionStorage.setItem('_lastSubtotal',  String(subtotal));
    sessionStorage.setItem('_lastDelivery',  String(delivery));
    sessionStorage.setItem('_lastGrandTotal', String(grandTotal));
    sessionStorage.setItem('_lastMethod',    pm);
    sessionStorage.setItem('_lastOrderId',   oid);

    // 2. Always save to localStorage so /orders page shows it
    saveOrderLocally(oid, pm, snapshot);

    // 3. Clear cart + show done state
    clearCart();
    setOrderId(oid);
    setProcessing(false);
    setDone(true);
    toast.success('🎉 Order placed! Supporting MP artisans!');
    setTimeout(() => generatePDF(), 800);
    setTimeout(() => navigate('/orders'), 4500);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ── PAY HANDLER — main payment logic ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const payHandler = async () => {
    if (items.length === 0) { toast.error('Your cart is empty!'); return; }
    setProcessing(true);

    // ── COD path ─────────────────────────────────────────────────────────────
    if (method === 'cod') {
      try {
        const { data } = await api.post('/payment/cod', {
          items: items.map(p => ({
            title: p.title, price: p.price, quantity: p.quantity || 1,
            url: p.url, origin: p.origin || '',
          })),
          subtotal, delivery, grandTotal, address,
        }).catch(() => ({ data: null })); // backend may be down — still finalize

        const oid = data?.orderId || ('NRM' + Date.now().toString().slice(-8).toUpperCase());
        finalizeOrder(oid, 'cod');
      } catch (err) {
        // Even on error, place order locally so user isn't stuck
        const oid = 'NRM' + Date.now().toString().slice(-8).toUpperCase();
        finalizeOrder(oid, 'cod');
      }
      return;
    }

    // ── Razorpay path (razorpay / upi / card — all go through Razorpay modal) ─
    try {
      let keyId, razorpayOrderId, amountPaise;

      if (backendUp) {
        // Step 1: Create Razorpay order on backend
        const { data } = await api.post('/payment/create-order', { amount: grandTotal });
        if (!data.success) throw new Error(data.message);
        keyId           = data.keyId;
        razorpayOrderId = data.razorpayOrderId;
        amountPaise     = data.amount; // already in paise from backend
      } else {
        // Fallback: use env key directly (dev mode without backend)
        keyId           = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Sg7ACMm8zxYXv2';
        razorpayOrderId = undefined; // Razorpay SDK allows undefined in test mode
        amountPaise     = grandTotal * 100;
      }

      // Step 2: Open Razorpay modal
      openRazorpay({
        keyId,
        razorpayOrderId,
        amountPaise,
        userName:  user?.name  || address?.name  || '',
        userEmail: user?.email || '',
        userPhone: address?.phone || '',
        description: `Narmavya — ${items.length} item${items.length>1?'s':''}`,

        // Step 3a: Payment SUCCESS
        onSuccess: async ({ razorpayPaymentId, razorpayOrderId: rzpOid, razorpaySignature }) => {
          try {
            if (backendUp) {
              const { data } = await api.post('/payment/verify', {
                razorpayOrderId: rzpOid,
                razorpayPaymentId,
                razorpaySignature,
                items: items.map(p => ({
                  title: p.title, price: p.price, quantity: p.quantity||1,
                  url: p.url, origin: p.origin||'', legacyId: p.id||null,
                })),
                subtotal, delivery, grandTotal,
                paymentMethod: method,
                address,
              });
              if (!data.success) throw new Error(data.message);
              finalizeOrder(data.orderId, method);
            } else {
              // Offline fallback
              const oid = 'NRM' + razorpayPaymentId.slice(-8).toUpperCase();
              saveOrderLocally(oid, method);
              finalizeOrder(oid, method);
            }
          } catch (err) {
            toast.error('Payment received but order save failed. Contact support with payment ID: ' + razorpayPaymentId);
            setProcessing(false);
          }
        },

        // Step 3b: Payment FAILED or cancelled
        onFailure: (err) => {
          if (err.message === 'Payment cancelled by user') {
            toast.info('Payment modal closed');
          } else {
            toast.error(err.message || 'Payment failed. Please try again.');
          }
          setProcessing(false);
        },
      });
    } catch (err) {
      toast.error(err.message || 'Could not initiate payment');
      setProcessing(false);
    }
  };

  const methods = [
    {
      id: 'razorpay', label: 'Pay Online',
      icon: 'ri-secure-payment-line',
      sub: 'UPI · Cards · Net Banking · Wallets',
      badge: 'Recommended',
    },
    {
      id: 'cod', label: 'Cash on Delivery',
      icon: 'ri-money-rupee-circle-line',
      sub: 'Pay when your order arrives',
      badge: null,
    },
  ];

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (!done && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] gond-texture flex flex-col">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-28">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily:"'Playfair Display',serif" }}>Cart is Empty</h2>
          <p className="text-gray-400 text-sm mb-8">Add items to proceed to payment</p>
          <button onClick={() => navigate('/products')} className="btn-primary px-8 py-3.5">Browse Products →</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture flex flex-col">
      <Nav />

      <main className="flex-grow pt-20 sm:pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4">

          <StepBar currentStep={done ? 3 : 2} />

          {/* ── Backend offline warning ──────────────────────────────────── */}
          {!backendUp && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
              <i className="ri-wifi-off-line text-amber-600 text-lg flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-800">Backend Offline — Demo Mode</p>
                <p className="text-amber-700 text-xs mt-0.5">Payments will be processed by Razorpay but orders won't save to MongoDB. Start <code className="bg-amber-100 px-1 rounded">backend/server.js</code> to go live.</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SUCCESS STATE                                                   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {done ? (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Confetti / success animation */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type:'spring', stiffness:250, damping:15, delay:0.2 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    style={{ background:'linear-gradient(135deg,#16a34a,#15803d)' }}
                  >
                    <i className="ri-check-line text-white text-4xl" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily:"'Playfair Display',serif" }}>
                    Order Confirmed! 🎉
                  </h2>
                  <p className="text-gray-500">Your artisanal products are on their way from Madhya Pradesh</p>
                  {orderId && <p className="text-[#E8650A] font-mono font-bold mt-2">Order #{orderId}</p>}
                </div>

                {/* Receipt */}
                <Receipt
                  ref={receiptRef}
                  items={(() => {
                    // Cart is already cleared by this point — use snapshot
                    const snap = JSON.parse(sessionStorage.getItem('_lastItems') || '[]');
                    return snap.length > 0 ? snap : items;
                  })()}
                  orderId={sessionStorage.getItem('_lastOrderId') || orderId}
                  address={address}
                  subtotal={Number(sessionStorage.getItem('_lastSubtotal') || subtotal)}
                  delivery={Number(sessionStorage.getItem('_lastDelivery') || delivery)}
                  grandTotal={Number(sessionStorage.getItem('_lastGrandTotal') || grandTotal)}
                  paymentMethod={sessionStorage.getItem('_lastMethod') || method}
                  user={user}
                />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button onClick={generatePDF}
                    className="flex-1 py-3.5 rounded-xl border-2 border-[#E8650A] text-[#E8650A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors">
                    <i className="ri-download-line" /> Download Receipt
                  </button>
                  <button onClick={() => navigate('/orders')}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background:'linear-gradient(135deg,#E8650A,#C4500A)' }}>
                    <i className="ri-shopping-bag-3-line" /> Track My Order
                  </button>
                </div>
              </motion.div>

            ) : (
            /* ═══════════════════════════════════════════════════════════════ */
            /* PAYMENT FORM                                                    */
            /* ═══════════════════════════════════════════════════════════════ */
              <motion.div key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
              >
                {/* ── LEFT: Payment methods ─────────────────────────────── */}
                <div className="lg:col-span-3 space-y-5">
                  {/* Header */}
                  <div className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white shadow-sm">
                    <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-1">Step 3 of 3</p>
                    <h2 className="font-display font-black text-gray-900 text-3xl mb-1">Payment</h2>
                    <p className="text-gray-400 text-sm">All transactions are secured & encrypted 🔒</p>
                  </div>

                  {/* Method cards */}
                  <div className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white shadow-sm space-y-4">
                    {methods.map((m) => (
                      <motion.label key={m.id} whileHover={{ y: -1 }}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          method === m.id
                            ? 'border-[#E8650A] bg-gradient-to-r from-orange-50 to-amber-50/50 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => setMethod(m.id)}
                      >
                        {/* Custom radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          method === m.id ? 'border-[#E8650A]' : 'border-gray-300'
                        }`}>
                          {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-[#E8650A]" />}
                        </div>

                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          method === m.id ? 'bg-[#E8650A]' : 'bg-gray-100'
                        }`}>
                          <i className={`${m.icon} text-xl ${method === m.id ? 'text-white' : 'text-gray-500'}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                            {m.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background:'rgba(232,101,10,0.1)', color:'#E8650A' }}>
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
                        </div>
                      </motion.label>
                    ))}

                    {/* Powered by Razorpay badge */}
                    {method !== 'cod' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3"
                      >
                        <i className="ri-shield-check-line text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-800 font-semibold text-xs">Powered by Razorpay — Test Mode</p>
                          <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                            Test card: <span className="font-mono font-bold">4111 1111 1111 1111</span><br/>
                            Expiry: any future date · CVV: any 3 digits<br/>
                            <span className="text-amber-600 font-semibold">OTP screen → click "Skip OTP"</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Delivery address summary */}
                  {address?.name && (
                    <div className="bg-white/85 rounded-[2rem] p-6 border border-white shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivering To</p>
                        <button onClick={() => navigate('/details-form')} className="text-xs text-[#E8650A] font-semibold hover:underline">Change</button>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{address.name}</p>
                      <p className="text-sm text-gray-500">{address.address}, {address.locality}, {address.city} — {address.pincode}</p>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Order summary ──────────────────────────────── */}
                <div className="lg:col-span-2">
                  <div className="lg:sticky lg:top-32">
                    <div className="bg-white/85 backdrop-blur-xl rounded-[2.5rem] p-7 border border-white shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-5 text-base">Order Summary</h3>

                      {/* Items list */}
                      <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                        {items.map((p, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                              <img src={p.url} alt={p.title} className="w-full h-full object-cover" onError={e=>e.target.src='https://via.placeholder.com/48'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                              <p className="text-xs text-gray-400">Qty: {p.quantity||1}</p>
                            </div>
                            <p className="font-bold text-sm text-[#E8650A] flex-shrink-0">₹{(p.price * (p.quantity||1)).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {/* Price breakdown */}
                      <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm mb-5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-green-600 font-semibold">{delivery === 0 ? 'FREE 🎉' : `₹${delivery}`}</span>
                        </div>
                        <div className="flex justify-between font-black text-base border-t border-gray-100 pt-3">
                          <span>Total</span>
                          <span className="text-[#E8650A]">₹{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.button
                        onClick={payHandler}
                        disabled={processing}
                        whileHover={processing ? {} : { y: -2, boxShadow: '0 16px 40px rgba(232,101,10,0.45)' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2.5 transition-all"
                        style={{
                          background: processing ? '#aaa' : 'linear-gradient(135deg,#E8650A,#C4500A)',
                          boxShadow: processing ? 'none' : '0 8px 25px rgba(232,101,10,0.35)',
                        }}
                      >
                        {processing ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                        ) : method === 'cod' ? (
                          <><i className="ri-shopping-bag-check-line text-lg" />Place Order — COD</>
                        ) : (
                          <><i className="ri-lock-line text-sm" />Pay ₹{grandTotal.toLocaleString()} Securely</>
                        )}
                      </motion.button>

                      {/* Trust */}
                      <div className="flex flex-col gap-1.5 mt-5 pt-4 border-t border-gray-100">
                        {['🔒 256-bit SSL Encryption','🌿 GI Authenticated Products','🚚 5–7 Day Artisan Delivery','↩️ Easy 7-Day Returns'].map(t => (
                          <p key={t} className="text-xs text-gray-400">{t}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
    </div>
  );
};

export default Payment;
