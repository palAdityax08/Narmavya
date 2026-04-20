import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import Nav from '../nav';
import Footer from './Footer';
import { mpProducts } from '../../data/mpProducts';

const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [view3D, setView3D] = useState(false);

  useEffect(() => {
    const foundProduct = mpProducts.find((p) => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id]);

  const addToCart = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.warn('Please log in to add items to cart!');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const existingProduct = user.products.find((p) => p.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      user.products.push({ ...product, quantity: 1, url: product.image });
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    toast.success('Added to your artisanal cart!');
    window.dispatchEvent(new Event('storage')); // Trigger nav update
  };
  
  const toggleWishlist = () => {
    let wl = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wl.some(item => item.id === product.id)) {
      wl = wl.filter(item => item.id !== product.id);
      toast.info('Removed from wishlist');
    } else {
      wl.push({ ...product, url: product.image });
      toast.success('Saved to wishlist!');
    }
    localStorage.setItem('wishlist', JSON.stringify(wl));
    window.dispatchEvent(new Event('storage'));
  };

  if (!product) {
     return (
       <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-[#E8650A] border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  const isDhokra = product.category === 'handicrafts' && product.title.includes('Dhokra');

  return (
    <div className="min-h-screen bg-[#FDF6EC] selection:bg-[#E8650A] selection:text-white flex flex-col">
      <Nav />

      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
           
           {/* Breadcrumbs */}
           <div className="flex items-center gap-2 mb-8 text-gray-400 text-xs">
             <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => navigate('/')}>Home</span>
             <i className="ri-arrow-right-s-line" />
             <span className="cursor-pointer hover:text-gray-900 transition-colors" onClick={() => navigate(`/products/${product.category}`)}>Products</span>
             <i className="ri-arrow-right-s-line" />
             <span className="text-gray-900">{product.title}</span>
           </div>

           <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
             
             {/* Media Gallery / 3D Viewer Placeholder */}
             <div className="w-full lg:w-[55%]">
               <div className="sticky top-32">
                 <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-gray-100 aspect-[4/5] md:aspect-square flex items-center justify-center">
                    
                    <AnimatePresence mode="wait">
                      {view3D ? (
                         <motion.div 
                           key="3d"
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="w-full h-full flex flex-col items-center justify-center bg-gray-50 cursor-grab active:cursor-grabbing"
                         >
                            <div className="text-gray-400 mb-4 animate-pulse">
                               <i className="ri-3d-model-line text-6xl" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center px-4">
                              Interactive 3D View <br/> <span className="font-light text-xs lowercase mt-2 block">(Drag to rotate)</span>
                            </p>
                            {/* Placeholder for react-three-fiber canvas */}
                            <div className="absolute inset-0 border-[4px] border-dashed border-gray-200/50 rounded-[2.5rem] pointer-events-none m-4" />
                         </motion.div>
                      ) : (
                         <motion.img 
                           key="2d"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.5 }}
                           src={product.image} 
                           alt={product.title} 
                           className="w-full h-full object-cover" 
                         />
                      )}
                    </AnimatePresence>

                    {/* Badge */}
                    {product.badge && !view3D && (
                      <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/40 text-xs font-bold uppercase tracking-wider shadow-sm z-10"
                           style={{ color: '#E8650A' }}>
                        {product.badge}
                      </div>
                    )}
                 </div>

                 {/* Media Controls */}
                 <div className="flex gap-4 mt-6 justify-center">
                    <button 
                      onClick={() => setView3D(false)}
                      className={`flex flex-col items-center gap-2 transition-opacity ${!view3D ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${!view3D ? 'border-[#E8650A]' : 'border-transparent'}`}>
                         <img src={product.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Image</span>
                    </button>

                    {isDhokra && (
                       <button 
                         onClick={() => setView3D(true)}
                         className={`flex flex-col items-center gap-2 transition-opacity ${view3D ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                       >
                         <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-white shadow-sm border-2 ${view3D ? 'border-[#E8650A]' : 'border-gray-100'}`}>
                            <i className="ri-box-3-line text-2xl text-gray-400" />
                         </div>
                         <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">3D View</span>
                       </button>
                    )}
                 </div>

               </div>
             </div>

             {/* Product Details side */}
             <div className="w-full lg:w-[45%] lg:py-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-[#E8650A] text-xs font-bold uppercase tracking-widest mb-3">{product.origin}</p>
                  <h1 className="text-4xl md:text-5xl font-black font-display text-gray-900 leading-[1.1] mb-5">
                    {product.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-8">
                     <span className="text-3xl font-bold" style={{ color: '#E8650A' }}>
                       ₹{product.price.toLocaleString()}
                     </span>
                     {product.originalPrice && (
                       <span className="text-lg text-gray-400 line-through">
                         ₹{product.originalPrice.toLocaleString()}
                       </span>
                     )}
                     <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold ml-auto border border-green-200">
                        <i className="ri-star-fill text-[#D4A017]" />
                        {product.rating} ({product.reviews})
                     </div>
                  </div>

                  <p className="text-gray-600 text-base leading-relaxed mb-10 font-light">
                    {product.description}
                  </p>

                  {/* Divider */}
                  <div className="h-px w-full bg-gray-200/50 mb-10" />

                  {/* Artisan Story */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl font-display text-gray-400">
                          {product.artisan.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Crafted By</p>
                           <p className="font-bold text-gray-900 text-lg">{product.artisan}</p>
                           <p className="text-xs text-[#E8650A] font-medium"><i className="ri-award-line mr-1" /> Master Artisan</p>
                        </div>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-10">
                     <button
                       onClick={addToCart}
                       className="flex-1 py-5 rounded-[1.5rem] font-bold text-white text-base transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(232,101,10,0.3)] hover:shadow-[0_15px_40px_rgba(232,101,10,0.4)]"
                       style={{ background: 'linear-gradient(135deg, #E8650A, #C4500A)' }}
                     >
                        Add to Cart — ₹{product.price.toLocaleString()}
                     </button>
                     <button
                       onClick={toggleWishlist}
                       className="w-full sm:w-[72px] h-[72px] rounded-[1.5rem] flex items-center justify-center bg-white border border-gray-200 hover:border-[#E8650A] hover:text-[#E8650A] text-gray-400 text-2xl transition-colors shadow-sm"
                     >
                       <i className="ri-heart-line" />
                     </button>
                  </div>

                  {/* Trust Signals */}
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                     <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-truck-line text-[#1B6B3A] text-xl" />
                        <span className="font-medium">Free Delivery ₹499</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-shield-check-line text-[#1B6B3A] text-xl" />
                        <span className="font-medium">GI Authenticated</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-hand-heart-line text-[#1B6B3A] text-xl" />
                        <span className="font-medium">Fair Trade Certified</span>
                     </div>
                     <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-leaf-line text-[#1B6B3A] text-xl" />
                        <span className="font-medium">100% Organic Dyes</span>
                     </div>
                  </div>

                </motion.div>
             </div>
           </div>
        </div>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="colored" autoClose={2500} />
    </div>
  );
};

export default ProductInfo;
