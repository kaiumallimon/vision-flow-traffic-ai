'use client';

import { useAuth } from '@/lib/auth-context';
import ImageUpload from '@/components/ImageUpload';

export default function AnalyzePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyze Image</h1>
        <p className="text-muted-foreground mt-1">
          Upload and detect traffic objects with AI
        </p>
      </div>
      <ImageUpload email={user?.email} />
    </div>
  );
}
