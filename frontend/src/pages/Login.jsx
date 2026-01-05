import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In the future, we will add actual authentication here.
    // For now, it simply navigates to the dashboard.
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* LEFT SIDE: Professional Branding */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 text-white justify-center items-center p-12 relative">
        <div className="z-10 text-center">
          <div className="bg-white/20 p-4 rounded-3xl inline-block mb-6 backdrop-blur-md">
            <ShieldCheck size={60} />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter">VISION FLOW AI</h1>
          <p className="text-xl opacity-90 font-medium">Smart Traffic Monitoring & Advisor System</p>
          <div className="mt-8 pt-8 border-t border-blue-400/30 text-sm font-bold uppercase tracking-widest opacity-60">
            Thesis Project v1.0
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium">Access your AI Advisor Dashboard</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
              <input type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" placeholder="zul@thesis.edu" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <input type="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
              <Lock size={18} /> Authorize & Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;