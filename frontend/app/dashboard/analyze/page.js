'use client';

import { useState, useEffect } from 'react';
import ImageUploadComponent from '@/components/ImageUpload';

export default function AnalyzePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Analyze Traffic Image
        </h1>
        <p className="text-slate-600 mt-2">
          Upload an image to detect and analyze traffic patterns with AI
        </p>
      </div>

      {user && (
        <ImageUploadComponent
          email={user.email}
          onSuccess={() => {
            // Could refresh history or stats here
          }}
        />
      )}
    </div>
  );
}
