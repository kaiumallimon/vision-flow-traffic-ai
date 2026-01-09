'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const localStorageUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold">Auth Context State:</h3>
            <pre className="bg-slate-800 text-white p-4 rounded mt-2 overflow-auto">
              {JSON.stringify({
                isAuthenticated,
                hasToken: !!token,
                tokenPreview: token ? token.substring(0, 30) + '...' : null,
                user,
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">LocalStorage:</h3>
            <pre className="bg-slate-800 text-white p-4 rounded mt-2 overflow-auto">
              {JSON.stringify({
                hasToken: !!localStorageToken,
                tokenPreview: localStorageToken ? localStorageToken.substring(0, 30) + '...' : null,
                hasUser: !!localStorageUser,
                user: localStorageUser ? JSON.parse(localStorageUser) : null,
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
