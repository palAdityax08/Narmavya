import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MP from '/log/MP.png';
import narmavyaLogo from '../assets/narmavya.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    name: '', email: '', password: '', confirmPassword: '', products: [], login: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = input;
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const existing = JSON.parse(localStorage.getItem('user'));
    if (existing && existing.email === email) {
      toast.error('An account with this email already exists');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    localStorage.setItem('user', JSON.stringify(input));
    toast.success('Account created! Welcome to Narmavya 🌿');
    setLoading(false);
    setTimeout(() => navigate('/login'), 1500);
  };

  const InputField = ({ label, name, type = 'text', placeholder, trailing }) => (
    <div>
      <label className="text-white/80 text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={input[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none text-sm transition-all w-full"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#E8650A')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
        />
        {trailing}
      </div>
    </div>
  );

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center py-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #051772 0%, #ffffff 40%, #3E1B00 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-20" style={{ background: '#E8650A', filter: 'blur(80px)' }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full opacity-15" style={{ background: '#D4A017', filter: 'blur(60px)' }} />
      <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${MP})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.2,
              }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
       
        <div className="flex items-center justify-center gap-3 mb-0">
            <img
              src={narmavyaLogo}
              alt="Narmavya Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <h1
              className="text-4xl font-black mb-0"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: 'linear-gradient(135deg, #E8650A, #D4A017)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Narmavya
            </h1>
            
          </div>
          <p className="flex items-center justify-center text-white/1 text-xs tracking-widest uppercase mt-2 mb-4">
            Join the MP Revolution
          </p>

        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-white/50 text-sm mb-6">Start your journey with authentic MP products</p>

          <form onSubmit={submitHandler} className="space-y-4">
            <InputField label="Full Name" name="name" placeholder="Your full name" />
            <InputField label="Email Address" name="email" type="email" placeholder="you@example.com" />
            <div>
              <label className="text-white/80 text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-4 pr-11 py-3 rounded-xl text-white placeholder:text-white/30 outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                  onFocus={(e) => (e.target.style.borderColor = '#E8650A')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                  <i className={`ri-${showPass ? 'eye-off' : 'eye'}-line`} />
                </button>
              </div>
            </div>
            <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Re-enter password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? '#999' : 'linear-gradient(135deg, #E8650A, #C4500A)',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(232,101,10,0.4)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create My Account →'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#E8650A] font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SignUp;
