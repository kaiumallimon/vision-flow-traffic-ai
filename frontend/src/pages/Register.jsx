import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, ShieldCheck } from 'lucide-react';

const API_BASE_URL = "/api";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
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
      alert("Registration failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-blue-600 mb-2" size={40} />
          <h2 className="text-3xl font-black text-slate-900">Join AI Advisor</h2>
        </div>
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="flex gap-2">
            <input type="text" placeholder="First" required className="w-1/2 px-4 py-3 bg-slate-50 border rounded-xl" />
            <input type="text" placeholder="Last" required className="w-1/2 px-4 py-3 bg-slate-50 border rounded-xl" />
          </div>
          <input type="email" placeholder="Email" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" />
          <input type="password" placeholder="Password" required className="w-full px-4 py-3 bg-slate-50 border rounded-xl" />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold uppercase transition-all"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Already have an account? <button onClick={() => navigate('/login')} className="text-blue-600 font-bold underline">Login</button>
        </p>
      </div>
    </div>
  );
};

export default Register;