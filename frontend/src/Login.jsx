import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Globe, Facebook } from 'lucide-react';

const API_BASE_URL = "/api";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      if (response.data.message === "Login successful") {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        alert(response.data.error || "Invalid Credentials");
      }
    } catch (error) {
      alert("Backend connection failed!");
    }
  };

  // Placeholder for Social Login Functions
  const handleSocialLogin = (platform) => {
    alert(`${platform} Login will be active once you provide the Client ID in the developer console.`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="hidden lg:flex w-1/2 bg-blue-600 text-white justify-center items-center p-12">
        <div className="text-center">
          <ShieldCheck size={80} className="mx-auto mb-6" />
          <h1 className="text-5xl font-black tracking-tighter">VISION FLOW AI</h1>
          <p className="text-xl opacity-80 mt-4 font-bold uppercase tracking-widest text-blue-200">Industry Advisor v1.0</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium text-sm">Access your secure AI dashboard</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <input type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Email" />
            <input type="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Password" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
              <Lock size={18} /> Authorize & Enter
            </button>
          </form>

          {/* SOCIAL LOGIN SECTION */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700">
              <Globe size={18} className="text-red-500" /> Google
            </button>
            <button onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700">
              <Facebook size={18} className="text-blue-600" /> Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm font-bold text-slate-500 uppercase tracking-tight">
            Need an account? <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">Register Now</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;