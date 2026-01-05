import React from 'react';

const Login = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 text-white justify-center items-center p-12">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">Vision Flow AI</h1>
          <p className="text-lg opacity-80">
            Advanced Traffic Analysis & Thesis Management. 
            Harnessing YOLO and Gemini for smarter urban flow.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details to login.</p>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="zul@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="••••••••" />
            </div>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg">
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account? <a href="#" className="text-indigo-600 font-bold hover:underline">Register</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;