import React, { useEffect, useState } from 'react';
import Nav from '../nav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Product = ({ id, url, title, price, quantity, onRemove, onUpdateQty }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -60 }}
    className="flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white hover:shadow-md transition-shadow"
  >
    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
      <img src={url} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>
      <p className="text-[#E8650A] font-black text-lg mt-0.5">₹{(price * quantity).toLocaleString()}</p>
      <p className="text-gray-400 text-xs">₹{price} × {quantity}</p>
    </div>
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => onUpdateQty(id, Math.max(1, quantity - 1))}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
        <button
          onClick={() => onUpdateQty(id, Math.min(10, quantity + 1))}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
      >
        <i className="ri-delete-bin-line" /> Remove
      </button>
    </div>
  </motion.div>
);

const AddToCart = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const loadProducts = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setProducts(user.products || []);
  };

  useEffect(() => { loadProducts(); }, []);

  const onRemove = (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const updated = user.products.filter((p) => p.id !== id);
    user.products = updated;
    localStorage.setItem('user', JSON.stringify(user));
    setProducts(updated);
    toast.info('Item removed from cart');
  };

  const onUpdateQty = (id, qty) => {
    const user = JSON.parse(localStorage.getItem('user'));
    user.products = user.products.map((p) => p.id === id ? { ...p, quantity: qty } : p);
    localStorage.setItem('user', JSON.stringify(user));
    setProducts(user.products);
  };

  const totalPrice = () =>
    Math.ceil(products.reduce((acc, p) => acc + p.price * (p.quantity || 1), 0));

  const totalItems = products.reduce((acc, p) => acc + (p.quantity || 1), 0);

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture">
        <Nav />
        <div className="pt-28 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        
          <img
            src="/artisan/empty.png"
            alt="Empty Cart"
            className="w-[150px] h-[150px] object-contain"
          />
          <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm">
            Discover authentic handcrafted products from Madhya Pradesh's finest artisans.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary px-8 py-3.5"
          >
            Explore MP Products →
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white gond-texture">
      <Nav />
      <div className="pt-28 max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Cart
        </h1>
        <p className="text-gray-500 text-sm mb-8">{totalItems} item{totalItems > 1 ? 's' : ''} from MP artisans</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {products.map((p) => (
                <Product key={p.id} {...p} onRemove={onRemove} onUpdateQty={onUpdateQty} />
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">₹{totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-green-600 font-semibold">{totalPrice() >= 499 ? 'FREE' : '₹60'}</span>
                </div>
                {totalPrice() < 499 && (
                  <p className="text-xs text-[#E8650A] bg-orange-50 px-3 py-2 rounded-lg">
                    Add ₹{499 - totalPrice()} more for free delivery!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between font-black text-lg">
                  <span>Total</span>
                  <span className="text-[#E8650A]">₹{(totalPrice() + (totalPrice() >= 499 ? 0 : 60)).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/details-form')}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}
              >
                Proceed to Checkout →
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full py-3 mt-2 rounded-xl text-sm text-gray-500 hover:text-[#E8650A] transition-colors"
              >
                ← Continue Shopping
              </button>
              {/* Trust */}
              <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-gray-100">
                {['🔒 100% Secure Payment', '🌿 Authentic MP Products', '🚚 Free Delivery ≥₹499'].map((t) => (
                  <p key={t} className="text-xs text-gray-400 flex items-center gap-1">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default AddToCart;
