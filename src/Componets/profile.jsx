import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from './nav';
import Footer from './Others/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet-async';

const TABS = [
  { id: 'profile',   label: 'My Profile',    icon: 'ri-user-line' },
  { id: 'orders',    label: 'My Orders',     icon: 'ri-shopping-bag-3-line' },
  { id: 'addresses', label: 'Address Book',  icon: 'ri-map-pin-2-line' },
];

const InputField = ({ label, name, type = 'text', placeholder, value, onChange, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
    />
  </div>
);

// ─── Order Status Tracker ────────────────────────────────────────────────────
const getOrderStatus = (order) => {
  const placed = new Date(order.date).getTime();
  const now = Date.now();
  const hoursElapsed = (now - placed) / (1000 * 60 * 60);
  if (hoursElapsed < 1) return { step: 0, label: 'Order Confirmed', color: '#E8650A' };
  if (hoursElapsed < 24) return { step: 1, label: 'Processing', color: '#D4A017' };
  if (hoursElapsed < 72) return { step: 2, label: 'Shipped', color: '#1B6B3A' };
  if (hoursElapsed < 120) return { step: 3, label: 'Out for Delivery', color: '#059669' };
  return { step: 4, label: 'Delivered', color: '#16a34a' };
};

const STATUS_STEPS = ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [addAddrMode, setAddAddrMode] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', address: '', city: '', state: 'Madhya Pradesh', pincode: '', isDefault: false });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) { navigate('/login'); return; }
    setUser(u);
    setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
  }, []);

  const saveProfile = () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    const updated = { ...user, ...form };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditMode(false);
    toast.success('Profile updated! ✅');
  };

  const savePassword = () => {
    if (!passForm.current || !passForm.newPass) { toast.error('Please fill all fields'); return; }
    if (passForm.current !== user.password) { toast.error('Current password is incorrect'); return; }
    if (passForm.newPass.length < 6) { toast.error('New password must be 6+ characters'); return; }
    if (passForm.newPass !== passForm.confirm) { toast.error('Passwords do not match'); return; }
    const updated = { ...user, password: passForm.newPass };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setPassForm({ current: '', newPass: '', confirm: '' });
    setShowPassForm(false);
    toast.success('Password changed! 🔐');
  };

  const saveAddress = () => {
    if (!addrForm.address.trim() || !addrForm.city.trim() || !addrForm.pincode.trim()) {
      toast.error('Please fill mandatory fields'); return;
    }
    const addresses = [...(user.addresses || [])];
    if (addrForm.isDefault) addresses.forEach(a => (a.isDefault = false));
    addresses.push({ ...addrForm, id: Date.now() });
    const updated = { ...user, addresses };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setAddrForm({ name: '', phone: '', address: '', city: '', state: 'Madhya Pradesh', pincode: '', isDefault: false });
    setAddAddrMode(false);
    toast.success('Address saved! 📍');
  };

  const removeAddress = (id) => {
    const addresses = (user.addresses || []).filter(a => a.id !== id);
    const updated = { ...user, addresses };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    toast.info('Address removed');
  };

  const setDefault = (id) => {
    const addresses = (user.addresses || []).map(a => ({ ...a, isDefault: a.id === id }));
    const updated = { ...user, addresses };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    toast.success('Default address updated');
  };

  if (!user) return null;

  const userInitials = () => {
    const p = (user.name || '?').trim().split(' ');
    return ((p[0]?.charAt(0) || '') + (p[1]?.charAt(0) || '')).toUpperCase();
  };

  const orders = user.orders || [];

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <Helmet>
        <title>My Profile — Narmavya</title>
        <meta name="description" content="Manage your Narmavya profile, orders, and delivery addresses." />
      </Helmet>
      <Nav />

      <main className="pt-20 sm:pt-28 pb-20 max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #E8650A, #1B6B3A)' }}>
            {userInitials()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {user.name || 'My Account'}
            </h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-[#E8650A] text-xs font-semibold mt-1">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#E8650A] text-white shadow-lg shadow-orange-200'
                  : 'bg-white text-gray-600 hover:text-[#E8650A] border border-gray-200'
              }`}>
              <i className={tab.icon} /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── PROFILE TAB ──────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#E8650A] hover:underline">
                      <i className="ri-edit-line" /> Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Name" name="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" disabled={!editMode} />
                  <InputField label="Email Address" name="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" disabled={!editMode} />
                  <InputField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit mobile" disabled={!editMode} />
                </div>
                {editMode && (
                  <div className="flex gap-3 mt-6">
                    <button onClick={saveProfile}
                      className="px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}>
                      Save Changes
                    </button>
                    <button onClick={() => { setEditMode(false); setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); }}
                      className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 border border-gray-200 text-sm">
                      Cancel
                    </button>
                  </div>
                )}

                {/* Password Section */}
                <div className="border-t border-gray-100 mt-8 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Password</h3>
                    <button onClick={() => setShowPassForm(v => !v)}
                      className="text-sm text-[#E8650A] font-semibold hover:underline flex items-center gap-1">
                      <i className="ri-lock-line" /> {showPassForm ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>
                  <AnimatePresence>
                    {showPassForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <InputField label="Current Password" name="current" type="password" value={passForm.current} onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
                          <InputField label="New Password" name="newPass" type="password" value={passForm.newPass} onChange={e => setPassForm(p => ({ ...p, newPass: e.target.value }))} placeholder="Min 6 chars" />
                          <InputField label="Confirm New Password" name="confirm" type="password" value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter" />
                        </div>
                        <button onClick={savePassword}
                          className="px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                          style={{ background: 'linear-gradient(135deg, #1B6B3A, #0F4A27)' }}>
                          Update Password
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ORDERS TAB ──────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {orders.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Discover authentic MP products and place your first order.</p>
                  <Link to="/products" className="px-8 py-3 rounded-full font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}>
                    Explore Products →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const status = getOrderStatus(order);
                    return (
                      <motion.div key={order.orderId} whileHover={{ y: -2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-sm p-6 cursor-pointer"
                        onClick={() => navigate(`/orders/${order.orderId}`)}>
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Order #{order.orderId}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: status.color + '18', color: status.color }}>
                            {status.label}
                          </span>
                        </div>
                        {/* Thumbnails */}
                        <div className="flex items-center gap-2 my-4">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                          <p className="font-black text-[#E8650A]">₹{order.grandTotal?.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ADDRESS BOOK ────────────────────────────────────── */}
          {activeTab === 'addresses' && (
            <motion.div key="addresses" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="space-y-4 mb-6">
                {(user.addresses || []).map(addr => (
                  <div key={addr.id} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            Default
                          </span>
                        )}
                        <p className="font-bold text-gray-900">{addr.name || user.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.city}</p>
                        <p className="text-sm text-gray-500">{addr.state} — {addr.pincode}</p>
                        {addr.phone && <p className="text-xs text-gray-400 mt-1">📱 {addr.phone}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        {!addr.isDefault && (
                          <button onClick={() => setDefault(addr.id)} className="text-xs text-[#E8650A] font-semibold hover:underline">Set Default</button>
                        )}
                        <button onClick={() => removeAddress(addr.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
                {(user.addresses || []).length === 0 && !addAddrMode && (
                  <div className="text-center py-16 text-gray-400">
                    <i className="ri-map-pin-add-line text-5xl block mb-3" />
                    <p className="text-sm">No saved addresses yet.</p>
                  </div>
                )}
              </div>

              {!addAddrMode ? (
                <button onClick={() => setAddAddrMode(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-[#E8650A] text-[#E8650A] font-semibold text-sm hover:bg-orange-50 transition-colors">
                  <i className="ri-add-line" /> Add New Address
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-sm p-8">
                  <h3 className="font-bold text-gray-900 mb-5">New Delivery Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <InputField label="Name" name="name" value={addrForm.name} onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))} placeholder="Recipient name" />
                    <InputField label="Phone" name="phone" type="tel" value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile number" />
                    <div className="sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Address *</label>
                      <textarea value={addrForm.address} onChange={e => setAddrForm(p => ({ ...p, address: e.target.value }))}
                        rows={3} placeholder="House no., Street, Area..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#E8650A] outline-none text-sm resize-none" />
                    </div>
                    <InputField label="City / District *" name="city" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} placeholder="Bhopal, Indore..." />
                    <InputField label="Pincode *" name="pincode" value={addrForm.pincode} onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value }))} placeholder="6-digit pincode" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-5 cursor-pointer">
                    <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} className="accent-[#E8650A]" />
                    Set as default address
                  </label>
                  <div className="flex gap-3">
                    <button onClick={saveAddress}
                      className="px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}>
                      Save Address
                    </button>
                    <button onClick={() => setAddAddrMode(false)}
                      className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 border border-gray-200 text-sm">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={2500} />
    </div>
  );
};

export default Profile;
