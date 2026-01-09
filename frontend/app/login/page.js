'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = `${typeof window !== 'undefined' ? window.location.origin : ''}/api`;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.tokens.access);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-4">
          <ShieldCheck className="w-12 h-12 text-blue-600" />
          <CardTitle>Vision Flow AI</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Email</label>
              <Input name="email" type="email" placeholder="your@email.com" required />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Password</label>
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <a href="/register" className="font-semibold text-blue-600 hover:underline">
                Register here
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
