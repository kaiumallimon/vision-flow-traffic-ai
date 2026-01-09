import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = window.location.origin + "/api";

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/login`, { email: e.target[0].value, password: e.target[1].value });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('token', res.data.tokens.access);
            navigate('/dashboard');
        } catch (err) { alert("Invalid login!"); }
    };

    const handleGoogle = async (response) => {
        const details = jwtDecode(response.credential);
        const res = await axios.post(`${API_BASE_URL}/auth/google`, {
            email: details.email, first_name: details.given_name, last_name: details.family_name, google_id: details.sub
        });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.tokens.access);
        navigate('/dashboard');
    };

    return (
        <GoogleOAuthProvider clientId="53161265178-lm326anrb5k8hmp3ql2i5ls6kkfuti8l.apps.googleusercontent.com">
            <div className="flex min-h-screen bg-slate-100">
                <div className="hidden lg:flex w-1/2 bg-blue-700 text-white flex-col justify-center items-center p-12">
                    <ShieldCheck size={100} />
                    <h1 className="text-4xl font-bold mt-4 uppercase">Vision Flow AI</h1>
                    <p className="text-blue-200 mt-2"> Project by ASTRIKER</p>
                </div>
                <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
                    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">
                        <h2 className="text-2xl font-bold text-center mb-8">Sign In</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="email" placeholder="Email" required className="w-full p-4 border rounded-xl" />
                            <input type="password" placeholder="Password" required className="w-full p-4 border rounded-xl" />
                            <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">LOGIN</button>
                        </form>
                        <div className="text-center my-4 text-gray-400">OR</div>
                        <div className="flex justify-center"><GoogleLogin onSuccess={handleGoogle} shape="pill" /></div>
                        <p className="text-center mt-6">Don't have an account? <Link to="/register" className="text-blue-600 font-bold">Register</Link></p>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
