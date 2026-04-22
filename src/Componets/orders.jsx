import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from './nav';
import Footer from './Others/Footer';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';

const getOrderStatus = (order) => {
  const placed = new Date(order.date || order.createdAt).getTime();
  const hoursElapsed = (Date.now() - placed) / (1000 * 60 * 60);
  if (hoursElapsed < 1)   return { step: 0, label: 'Confirmed',        color: '#E8650A' };
  if (hoursElapsed < 24)  return { step: 1, label: 'Processing',       color: '#D4A017' };
  if (hoursElapsed < 72)  return { step: 2, label: 'Shipped',          color: '#1B6B3A' };
  if (hoursElapsed < 120) return { step: 3, label: 'Out for Delivery', color: '#059669' };
  return { step: 4, label: 'Delivered', color: '#16a34a' };
};

// Merge local + backend orders, deduplicate by orderId
const mergeOrders = (local, remote) => {
  const map = new Map();
  [...local, ...remote].forEach(o => {
    if (!map.has(o.orderId)) map.set(o.orderId, o);
  });
  return [...map.values()].sort((a, b) =>
    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always show local orders immediately
    const local = JSON.parse(localStorage.getItem('user'))?.orders || [];
    setOrders(local);
    setLoading(false);

    // Then try to merge with backend orders
    const token = localStorage.getItem('narmavya_token');
    if (token) {
      api.get('/orders/mine')
        .then(({ data }) => {
          if (data?.orders?.length) {
            setOrders(prev => mergeOrders(prev, data.orders));
          }
        })
        .catch(() => {});  // silently fail — local orders shown regardless
    }
  }, []);

  const filtered = filter === 'all' ? orders
    : filter === 'active'    ? orders.filter(o => getOrderStatus(o).step < 4)
    : orders.filter(o => getOrderStatus(o).step === 4);

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Helmet>
        <title>My Orders — Narmavya</title>
        <meta name="description" content="Track your Narmavya orders, view invoices and delivery status." />
      </Helmet>
      <Nav />
      <main className="pt-20 sm:pt-28 pb-20 max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>My Orders</h1>
              <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
            </div>
            <Link to="/profile" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E8650A] transition-colors font-medium">
              <i className="ri-user-line" /> Profile
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {[['all', 'All Orders'], ['active', 'Active'], ['delivered', 'Delivered']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === val ? 'bg-[#E8650A] text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}>
                {lbl}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#E8650A] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Here</h3>
              <p className="text-gray-500 text-sm mb-6">{filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders found.`}</p>
              <Link to="/products" className="px-8 py-3 rounded-full font-bold text-white text-sm inline-block"
                style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}>
                Explore Products →
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((order, idx) => {
              const status = getOrderStatus(order);
              const orderItems = order.items || [];
              return (
                <motion.div key={order.orderId || order._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  onClick={() => navigate(`/orders/${order.orderId || order._id}`)}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-gray-900 font-mono text-sm">#{order.orderId || order._id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.date || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: status.color + '18', color: status.color }}>
                      ● {status.label}
                    </span>
                  </div>

                  {/* Product thumbs */}
                  {orderItems.length > 0 && (
                    <div className="flex items-center gap-2 my-4">
                      {orderItems.slice(0, 5).map((item, i) => (
                        <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover"
                            onError={e => e.target.src = 'https://via.placeholder.com/56?text=🛍️'} />
                        </div>
                      ))}
                      {orderItems.length > 5 && (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          +{orderItems.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                      {order.paymentMethod && <span className="ml-2 uppercase text-gray-400">· {order.paymentMethod}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-[#E8650A] text-lg">₹{(order.grandTotal || 0).toLocaleString()}</p>
                      <i className="ri-arrow-right-s-line text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
