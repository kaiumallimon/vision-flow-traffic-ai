import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Globe, Facebook } from 'lucide-react';

const API_BASE_URL = "/api";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const userData = {
      first_name: e.target[0].value,
      last_name: e.target[1].value,
      email: e.target[2].value,
      password: e.target[3].value
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
      if (response.data.message) {
        alert("Success! Now please login.");
        navigate('/login');
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      alert("Registration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Create Account</h2>
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="flex gap-2">
            <input type="text" placeholder="First" required className="w-1/2 px-4 py-3 bg-slate-50 border rounded-xl" />
            <input type="text" placeholder="Last" required className="w-1/2 px-4 py-3 bg-slate-50 border rounded-xl" />
          </div>
          <input type="email" placeholder="Email" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" />
          <input type="password" placeholder="Password" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" />
          
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2">
            <UserPlus size={20} /> Register Account
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Social Register</span></div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl hover:bg-slate-50 font-bold text-sm"><Globe size={16}/> Google</button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl hover:bg-slate-50 font-bold text-sm"><Facebook size={16}/> Facebook</button>
        </div>
        
        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Already have an account? <button onClick={() => navigate('/login')} className="text-blue-600 font-bold underline">Login</button>
        </p>
      </div>
    </div>
  );
};

export default Register;