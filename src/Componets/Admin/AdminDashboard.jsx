import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer }   from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate }             from 'react-router-dom';
import useAuthStore                from '../../store/authStore';
import api                         from '../../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MANAGER
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'silk-textiles','handloom-clothing','carpets-rugs','handicrafts',
  'tribal-art','stone-craft','leather-craft','bamboo-cane',
  'jewelry','organic-spices','organic-food','home-decor',
];

const EMPTY_FORM = {
  title:'', titleHi:'', category:'handicrafts', price:'', originalPrice:'',
  images:'', description:'', badge:'', origin:'', artisan:'',
  inStock: true, stock:'',
};

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [catFilter,setCatFilter]= useState('');
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editing,  setEditing]  = useState(null); // product _id being edited
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search)    params.set('q', search);
      if (catFilter) params.set('category', catFilter);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title, titleHi: p.titleHi || '', category: p.category,
      price: p.price, originalPrice: p.originalPrice || '',
      images: (p.images || [p.image]).join(', '),
      description: p.description || '', badge: p.badge || '',
      origin: p.origin || '', artisan: p.artisan || '',
      inStock: p.inStock !== false, stock: p.stock || '',
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: form.stock ? Number(form.stock) : null,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('Product updated ✓');
      } else {
        await api.post('/products', payload);
        toast.success('Product created ✓');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>Product Inventory</h2>
          <p className="text-gray-400 text-xs mt-0.5">{total} total products</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          style={{ background:'linear-gradient(135deg,#E8650A,#C4500A)' }}>
          <i className="ri-add-line" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] transition-colors" />
        </div>
        <select value={catFilter} onChange={e=>{ setCatFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] transition-colors bg-white">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g,' ')}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#E8650A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead style={{ background:'linear-gradient(135deg,#3E1B00,#1B6B3A)' }}>
              <tr>
                {['Image','Title','Category','Price','Stock','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-white/80 font-semibold text-xs uppercase tracking-wider first:rounded-tl-2xl last:rounded-tr-2xl">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i*0.03 }}
                  className="bg-white hover:bg-orange-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={p.image || p.images?.[0]} alt={p.title} className="w-full h-full object-cover" onError={e=>e.target.src='https://via.placeholder.com/40'} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]">{p.title}</p>
                    {p.badge && <span className="text-[10px] text-[#E8650A] font-bold uppercase tracking-wider">{p.badge}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 capitalize">{p.category?.replace(/-/g,' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-black text-[#E8650A]">₹{p.price?.toLocaleString()}</p>
                    {p.originalPrice && <p className="text-xs text-gray-400 line-through">₹{p.originalPrice?.toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.inStock !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {p.inStock !== false ? (p.stock ? `${p.stock} left` : 'In Stock') : 'Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-[#E8650A] transition-colors">
                        <i className="ri-edit-line text-sm" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                        {deleting === p._id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <i className="ri-delete-bin-line text-sm" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">Showing {Math.min(page*12, total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:border-[#E8650A] transition-colors">← Prev</button>
            <button onClick={() => setPage(p=>p+1)} disabled={page*12>=total}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold disabled:opacity-40 hover:border-[#E8650A] transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ x:400 }} animate={{ x:0 }} exit={{ x:400 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
              onClick={e=>e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="font-black text-lg text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <i className="ri-close-line text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {[
                  ['Title (English)', 'title', 'text', true],
                  ['Title (Hindi)', 'titleHi', 'text', false],
                  ['Price (₹)', 'price', 'number', true],
                  ['Original Price (₹)', 'originalPrice', 'number', false],
                  ['Badge', 'badge', 'text', false],
                  ['Origin', 'origin', 'text', false],
                  ['Artisan / Maker', 'artisan', 'text', false],
                  ['Stock Quantity', 'stock', 'number', false],
                ].map(([label, key, type, required]) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
                    <input type={type} value={form[key]} required={required}
                      onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] transition-colors" />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] bg-white">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c.replace(/-/g,' ')}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Images (comma-separated URLs)</label>
                  <textarea value={form.images} onChange={e=>setForm(f=>({...f,images:e.target.value}))}
                    rows={3} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] transition-colors resize-none" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] transition-colors resize-none" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${form.inStock ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => setForm(f=>({...f,inStock:!f.inStock}))}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${form.inStock ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">In Stock</span>
                </label>

                <button type="submit" disabled={saving}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: saving ? '#aaa' : 'linear-gradient(135deg,#E8650A,#C4500A)', boxShadow: saving ? 'none':'0 8px 25px rgba(232,101,10,0.3)' }}>
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</> : (editing ? 'Update Product' : 'Create Product')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER MANAGER
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Confirmed','Processing','Shipped','Out for Delivery','Delivered','Cancelled'];
const STATUS_COLORS  = {
  Confirmed:'#E8650A', Processing:'#D4A017', Shipped:'#2563eb',
  'Out for Delivery':'#059669', Delivered:'#16a34a', Cancelled:'#dc2626',
};

const OrderManager = () => {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [updating,setUpdating]= useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/orders${params}`);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load orders — make sure you are logged in as admin');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId || o.orderId === orderId ? { ...o, status } : o));
      toast.success(`Order status → ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>Order Management</h2>
          <p className="text-gray-400 text-xs mt-0.5">{total} total orders</p>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E8650A] bg-white">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-[#E8650A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="ri-inbox-line text-5xl block mb-3" />
          <p className="font-semibold">No orders found</p>
          <p className="text-xs mt-1">Orders placed by users will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.04 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <p className="font-mono font-bold text-gray-800 text-sm">#{order.orderId}</p>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: STATUS_COLORS[order.status]+'18', color: STATUS_COLORS[order.status] }}>
                      ● {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.userId?.name || 'Unknown'} · {order.userId?.email || '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                  {/* Item thumbs */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.items?.slice(0,4).map((item, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" onError={e=>e.target.src='https://via.placeholder.com/40'} />
                      </div>
                    ))}
                    {order.items?.length > 4 && <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">+{order.items.length-4}</div>}
                  </div>
                </div>

                {/* Total + Status changer */}
                <div className="flex flex-col items-end gap-3">
                  <p className="font-black text-[#E8650A] text-lg">₹{order.grandTotal?.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    {updating === order._id && <div className="w-4 h-4 border-2 border-[#E8650A] border-t-transparent rounded-full animate-spin" />}
                    <select
                      value={order.status}
                      disabled={updating === order._id}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      className="px-3 py-2 rounded-xl border-2 text-xs font-bold outline-none cursor-pointer transition-colors bg-white"
                      style={{ borderColor: STATUS_COLORS[order.status], color: STATUS_COLORS[order.status] }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS CARDS
// ─────────────────────────────────────────────────────────────────────────────
const StatsCard = ({ icon, label, value, sub, gradient }) => (
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
    className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg"
    style={{ background: gradient }}>
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-white -translate-y-6 translate-x-6" />
    <i className={`${icon} text-2xl opacity-80 mb-3 block`} />
    <p className="text-3xl font-black">{value}</p>
    <p className="font-semibold text-sm mt-0.5 opacity-90">{label}</p>
    {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate                = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const [tab,   setTab]         = useState('overview');
  const [stats, setStats]       = useState({ products:0, orders:0, revenue:0, users:0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Quick stats
    Promise.all([
      api.get('/products?limit=1').catch(()=>({ data:{ total:0 } })),
      api.get('/orders?limit=1').catch(()=>({ data:{ total:0 } })),
    ]).then(([pRes, oRes]) => {
      setStats(prev => ({
        ...prev,
        products: pRes.data?.total || 0,
        orders:   oRes.data?.total || 0,
      }));
    });
  }, []);

  const TABS = [
    { id:'overview',  icon:'ri-dashboard-line',     label:'Overview'  },
    { id:'products',  icon:'ri-store-2-line',         label:'Products'  },
    { id:'orders',    icon:'ri-shopping-bag-3-line',  label:'Orders'    },
  ];

  return (
    <div className="min-h-screen flex" style={{ background:'#f8f4ef' }}>
      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="fixed left-0 top-0 h-full flex flex-col shadow-2xl z-40 overflow-hidden"
        style={{ background:'linear-gradient(160deg,#1a0a00 0%,#1B6B3A 100%)' }}>

        {/* Brand */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#E8650A,#D4A017)' }}>
            <i className="ri-leaf-line text-white text-lg" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-10 }}>
                <p className="font-black text-white text-sm" style={{ fontFamily:"'Playfair Display',serif" }}>Narmavya</p>
                <p className="text-white/40 text-[9px] uppercase tracking-widest">Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${tab===t.id ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
              <i className={`${t.icon} text-xl flex-shrink-0`} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    className="text-sm font-semibold">{t.label}</motion.span>
                )}
              </AnimatePresence>
              {tab===t.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8650A] flex-shrink-0" />}
            </button>
          ))}
        </nav>

        {/* Bottom: user + collapse */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button onClick={() => setSidebarOpen(v=>!v)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <i className={`ri-${sidebarOpen ? 'contract' : 'expand'}-left-right-line text-xl flex-shrink-0`} />
            {sidebarOpen && <span className="text-xs font-semibold">Collapse</span>}
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all">
            <i className="ri-logout-box-r-line text-xl flex-shrink-0" />
            {sidebarOpen && <span className="text-xs font-semibold">Logout</span>}
          </button>
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <i className="ri-arrow-left-line text-xl flex-shrink-0" />
            {sidebarOpen && <span className="text-xs font-semibold">Back to Site</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarOpen ? 240 : 72, transition:'margin 0.3s ease' }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-gray-900" style={{ fontFamily:"'Playfair Display',serif" }}>
              {tab === 'overview' ? 'Dashboard Overview' : tab === 'products' ? 'Product Manager' : 'Order Manager'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👑</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
              style={{ background:'linear-gradient(135deg,#E8650A,#1B6B3A)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* ── Overview Tab ── */}
          {tab === 'overview' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard icon="ri-store-2-line"        label="Total Products"  value={stats.products} sub="in catalog"        gradient="linear-gradient(135deg,#E8650A,#C4500A)" />
                <StatsCard icon="ri-shopping-bag-3-line" label="Total Orders"    value={stats.orders}   sub="all time"         gradient="linear-gradient(135deg,#1B6B3A,#0F4A27)" />
                <StatsCard icon="ri-user-line"           label="Registered Users"value="—"             sub="connect backend"  gradient="linear-gradient(135deg,#D4A017,#a87a00)" />
                <StatsCard icon="ri-money-rupee-circle-line" label="Revenue"    value="₹—"            sub="connect backend"  gradient="linear-gradient(135deg,#7c3aed,#4c1d95)" />
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label:'Manage Products', sub:'Add, edit or delete catalog items', icon:'ri-store-2-line', tab:'products', color:'#E8650A' },
                  { label:'Manage Orders',   sub:'Update shipping status for customers', icon:'ri-shopping-bag-3-line', tab:'orders', color:'#1B6B3A' },
                ].map(card => (
                  <motion.button key={card.tab} whileHover={{ y:-2 }} onClick={() => setTab(card.tab)}
                    className="bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: card.color+'18' }}>
                      <i className={`${card.icon} text-2xl`} style={{ color: card.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{card.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{card.sub}</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-gray-300 text-xl ml-auto" />
                  </motion.button>
                ))}
              </div>

              {/* Setup guide */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex gap-3">
                  <i className="ri-information-line text-amber-600 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">Setup Required to see live data</p>
                    <ol className="text-amber-700 text-xs mt-2 space-y-1 list-decimal list-inside">
                      <li>Create <code className="bg-amber-100 px-1 rounded">backend/.env</code> from <code className="bg-amber-100 px-1 rounded">.env.example</code> with your MongoDB URI</li>
                      <li>Run <code className="bg-amber-100 px-1 rounded">cd backend && npm run seed</code> to import 84 products</li>
                      <li>Run <code className="bg-amber-100 px-1 rounded">npm run dev</code> in the backend folder</li>
                      <li>Set your email to admin in MongoDB Atlas or via the seed script</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && <ProductManager />}
          {tab === 'orders'   && <OrderManager />}
        </div>
      </main>

      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default AdminDashboard;
