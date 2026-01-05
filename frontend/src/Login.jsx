import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock } from 'lucide-react';

const API_BASE_URL = "/api"; // Using your proxy setup

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
        alert(response.data.error);
      }
    } catch (error) {
      alert("Backend error. Check Terminal!");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="hidden lg:flex w-1/2 bg-blue-600 text-white justify-center items-center p-12 relative">
        <div className="z-10 text-center">
          <ShieldCheck size={60} className="mx-auto mb-6" />
          <h1 className="text-5xl font-black mb-4 tracking-tighter">VISION FLOW AI</h1>
          <p className="text-xl opacity-90">Thesis Project v1.0</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Sign In</h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <input type="email" required className="w-full px-5 py-4 bg-slate-50 border rounded-2xl" placeholder="Email" />
            <input type="password" required className="w-full px-5 py-4 bg-slate-50 border rounded-2xl" placeholder="Password" />
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase">
              Authorize & Enter
            </button>
          </form>
          <p className="mt-8 text-center text-sm font-bold text-slate-500">
            No account? <button onClick={() => navigate('/register')} className="text-blue-600 underline">Register Now</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;