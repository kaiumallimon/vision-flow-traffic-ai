import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock } from 'lucide-react';

//const API_BASE_URL = "/api";
const API_BASE_URL = "https://lilith-transposable-clarence.ngrok-free.dev";

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
      alert("Backend connection failed! Check if Python is running.");
    }
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
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Email Address</label>
              <input type="email" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" placeholder="name@email.com" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Password</label>
              <input type="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
              <Lock size={18} /> Authorize & Enter
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-500 uppercase tracking-tight">
            Need an account? <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">Register Now</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;