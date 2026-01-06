import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "https://lilith-transposable-clarence.ngrok-free.dev";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, formData);
      if (res.data.message === "Success") {
        alert("Registration Successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      // Show the specific backend error (like 'Invalid or fake email')
      alert(err.response?.data?.detail || "Registration Failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const details = jwtDecode(credentialResponse.credential);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        email: details.email,
        first_name: details.given_name,
        last_name: details.family_name,
        google_id: details.sub
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert("Social Registration Failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId="53161265178-lm326anrb5k8hmp3ql2i5ls6kkfuti8l.apps.googleusercontent.com">
      <div className="flex min-h-screen bg-slate-50 font-sans">
        
        {/* LEFT BLUE SIDEBAR */}
        <div className="hidden lg:flex w-1/2 bg-blue-700 text-white flex-col justify-center items-center p-12">
          <div className="text-center">
            <UserPlus size={80} className="mx-auto mb-6 opacity-90" />
            <h1 className="text-5xl font-black tracking-tighter uppercase">Join Vision Flow</h1>
            <p className="mt-4 text-blue-100 text-lg">Create your account to start AI analysis.</p>
          </div>
        </div>

        {/* RIGHT REGISTER FORM */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Create Account</h2>
            
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="First" 
                  required 
                  className="w-1/2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Last" 
                  required 
                  className="w-1/2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
              
              {/* UPDATED EMAIL INPUT WITH VALIDATION */}
              <input 
                type="email" 
                placeholder="Real Email Address" 
                required 
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                title="Please enter a valid email address"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              
              <input 
                type="password" 
                placeholder="Password" 
                required 
                minLength="6"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase hover:bg-black transition-all shadow-lg"
              >
                Register Account
              </button>
            </form>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Social Register</span>
            </div>

            <div className="flex justify-center">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => alert("Registration Failed")} 
                theme="outline"
                shape="pill"
                text="signup_with"
              />
            </div>

            <p className="mt-8 text-center text-slate-600 font-medium">
              Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;