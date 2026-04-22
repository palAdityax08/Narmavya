import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast }              from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation, Link }     from 'react-router-dom';
import gsap                                   from 'gsap';
import MP                                     from '/log/MP.png';
import narmavyaLogo                           from '../assets/narmavya.png';
import useAuthStore                           from '../store/authStore';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const returnTo  = location.state?.returnTo || '/';
  const [input, setInput]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const formRef = useRef(null);
  const bgRef   = useRef(null);

  const { loginWithEmail, loginWithGoogle, isLoggedIn } = useAuthStore();

  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn()) navigate(returnTo, { replace: true });
  }, []);

  useEffect(() => {
    gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 });
    gsap.fromTo(
      formRef.current,
      { scale: 0.8, opacity: 0, y: 60 },
      { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.7)', delay: 0.3 }
    );
  }, []);

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      toast.success(`Welcome, ${user.name?.split(' ')[0]}! 🌿`);
      setTimeout(() => navigate(returnTo), 900);
    } catch (err) {
      // If backend not connected yet, fall back gracefully
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        toast.warn('Backend not connected — using local mode');
        sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true }));
        setTimeout(() => navigate(returnTo), 900);
      } else {
        toast.error(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email Login ─────────────────────────────────────────────────────────────
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try backend first
      const user = await loginWithEmail(input.email, input.password);
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}! 🌿`);
      setTimeout(() => navigate(returnTo), 900);
    } catch (backendErr) {
      // Fallback: local localStorage auth (backward compat during transition)
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.email === input.email && user.password === input.password) {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
        sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true, expiry }));
        toast.success('Welcome back! 🌿');
        setTimeout(() => navigate(returnTo), 900);
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={bgRef}
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3E1B00 0%, #c7d4cc 50%, #560202cb 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-72 h-72 rounded-full opacity-20" style={{ background: '#E8650A', filter: 'blur(80px)' }} />
      <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-15" style={{ background: '#D4A017', filter: 'blur(60px)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: `url(${MP})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2 }} />

      <div ref={formRef} className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="flex items-center justify-center gap-3">
            <img src={narmavyaLogo} alt="Narmavya Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <h1 className="text-4xl font-black mb-0" style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #E8650A, #D4A017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Narmavya
            </h1>
          </div>
          <p className="text-white/60 text-xs tracking-widest uppercase mt-2">The Soul of Madhya Pradesh</p>
        </div>

        <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-white/50 text-sm mb-6">Login to continue your MP journey</p>

          {/* ── Google Sign-In Button ── */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl font-semibold text-gray-800 text-sm flex items-center justify-center gap-3 mb-5 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: googleLoading ? '#ddd' : '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-white/30 text-xs font-medium">or with email</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="text-white/80 text-sm font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email" required value={input.email}
                  onChange={(e) => setInput({ ...input, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                  onFocus={(e) => (e.target.style.borderColor = '#E8650A')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPass ? 'text' : 'password'} required value={input.password}
                  onChange={(e) => setInput({ ...input, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-white placeholder:text-white/30 outline-none text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                  onFocus={(e) => (e.target.style.borderColor = '#E8650A')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                  <i className={`ri-${showPass ? 'eye-off' : 'eye'}-line`} />
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
              style={{ background: loading ? '#999' : 'linear-gradient(135deg, #E8650A, #C4500A)', boxShadow: loading ? 'none' : '0 8px 25px rgba(232,101,10,0.4)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Logging in…</>
              ) : 'Login to Narmavya →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              New to Narmavya?{' '}
              <Link to="/signUp" className="text-[#E8650A] font-semibold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">🌿 Narmavya — Authentic Products from Madhya Pradesh</p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
