import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Nav from './nav';
import Footer from './Others/Footer';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const STATUS_STEPS = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
const STATUS_ICONS = ['ri-check-line', 'ri-box-3-line', 'ri-truck-line', 'ri-map-pin-2-line', 'ri-gift-line'];

const getStatusStep = (order) => {
  const placed = new Date(order.date).getTime();
  const hoursElapsed = (Date.now() - placed) / (1000 * 60 * 60);
  if (hoursElapsed < 1)   return 0;
  if (hoursElapsed < 24)  return 1;
  if (hoursElapsed < 72)  return 2;
  if (hoursElapsed < 120) return 3;
  return 4;
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user')) || {};
    const found = (u.orders || []).find(o => o.orderId === orderId);
    if (!found) { navigate('/orders'); return; }
    setOrder(found);
  }, [orderId]);

  const downloadInvoice = async () => {
    const el = invoiceRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Narmavya_Invoice_${orderId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };

  if (!order) return null;

  const step = getStatusStep(order);
  const total = order.grandTotal || order.subtotal;

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Helmet>
        <title>Order #{order.orderId} — Narmavya</title>
      </Helmet>
      <Nav />
      <main className="pt-28 pb-20 max-w-4xl mx-auto px-4">
        {/* Back */}
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8650A] transition-colors mb-6 font-medium">
          <i className="ri-arrow-left-line" /> Back to Orders
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Order #{order.orderId}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={downloadInvoice}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #1B6B3A, #0F4A27)' }}
          >
            <i className="ri-download-2-line" /> Download Invoice
          </button>
        </div>

        {/* ── TRACKER ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-8 mb-6">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <i className="ri-truck-line text-[#E8650A]" /> Delivery Tracking
          </h2>
          <div className="relative flex justify-between">
            {/* Progress line background */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
            {/* Progress line fill */}
            <motion.div
              className="absolute top-5 left-5 h-0.5 bg-[#E8650A] z-0"
              initial={{ width: 0 }}
              animate={{ width: `${(step / (STATUS_STEPS.length - 1)) * (100 - 10)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.4, type: 'spring' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
                  style={{
                    background: i <= step ? 'linear-gradient(135deg, #E8650A, #C4500A)' : 'white',
                    color: i <= step ? 'white' : '#9CA3AF',
                    border: i <= step ? 'none' : '2px solid #E5E7EB',
                  }}
                >
                  <i className={STATUS_ICONS[i]} />
                </motion.div>
                <span className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] ${i <= step ? 'text-[#E8650A]' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── ITEMS ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Order Items ({order.items.length})</h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                      {item.origin && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><i className="ri-map-pin-2-line text-[#E8650A]" />{item.origin}</p>}
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="font-bold text-gray-900 flex-shrink-0">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ───────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Price summary */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={order.delivery === 0 ? 'text-green-600 font-semibold' : ''}>{order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-gray-900 text-base">
                  <span>Total</span><span className="text-[#E8650A]">₹{total?.toLocaleString()}</span>
                </div>
                {order.paymentMethod && (
                  <p className="text-xs text-gray-400 pt-1 uppercase tracking-wider">Paid via {order.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Delivery address */}
            {order.address && Object.keys(order.address).length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><i className="ri-map-pin-2-line text-[#E8650A]" /> Delivery Address</h3>
                <p className="font-semibold text-gray-800 text-sm">{order.address.name}</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{order.address.address}, {order.address.locality}</p>
                <p className="text-gray-600 text-sm">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                {order.address.phone && <p className="text-gray-400 text-xs mt-2">📱 {order.address.phone}</p>}
              </div>
            )}

            <button onClick={() => navigate('/products')}
              className="w-full py-3 rounded-xl font-bold text-sm border-2 border-[#E8650A] text-[#E8650A] hover:bg-orange-50 transition-colors">
              Shop More Products
            </button>
          </div>
        </div>

        {/* ── HIDDEN INVOICE (for PDF export) ─────────────────────────── */}
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={invoiceRef} style={{ width: '794px', background: '#ffffff', fontFamily: 'sans-serif', padding: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #E8650A, #C4500A)', borderRadius: '12px', color: 'white' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>NARMAVYA</h1>
                <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>The Soul of Madhya Pradesh</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>INVOICE</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>#{order.orderId}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.75 }}>{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            {/* Address */}
            {order.address?.name && (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Delivered to</p>
                <p style={{ fontWeight: 700, margin: '0', fontSize: '14px' }}>{order.address.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{order.address.address}, {order.address.city} — {order.address.pincode}</p>
                {order.address.phone && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>📱 {order.address.phone}</p>}
              </div>
            )}
            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#FDF6EC', borderBottom: '2px solid #E8650A' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600 }}>{item.title}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>{item.quantity || 1}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', color: '#6B7280' }}>₹{item.price?.toLocaleString()}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: 700 }}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
              <div style={{ width: '220px', background: '#FDF6EC', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}><span>Delivery</span><span>{order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 900, color: '#E8650A', borderTop: '2px solid #E8650A', paddingTop: '8px' }}><span>TOTAL</span><span>₹{total?.toLocaleString()}</span></div>
              </div>
            </div>
            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: '11px' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#E8650A' }}>Thank you for supporting MP artisans!</p>
              <p style={{ margin: '4px 0 0' }}>narmavya.in | support@narmavya.in</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
