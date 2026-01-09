'use client';

import { ProfileContent } from '@/components/profile/profile-content';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information and preferences
        </p>
      </div>
      <ProfileContent />
    </div>
  );
}
