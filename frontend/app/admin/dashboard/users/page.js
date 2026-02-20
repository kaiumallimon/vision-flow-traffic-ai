'use client';

import { useEffect, useState } from 'react';
import { useAdminUsers } from '@/lib/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Search, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const PLAN_LABELS = { basic: 'Basic', pro: 'Pro', ultimate: 'Ultimate' };
const PLAN_COLORS = {
  basic: 'outline',
  pro: 'secondary',
  ultimate: 'default',
};

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { getUsers, updateUserRole, loading, error } = useAdminUsers();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      // handled in hook
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdating(user.id);
    try {
      await updateUserRole(user.id, newRole);
      await fetchUsers();
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) =>
    role === 'ADMIN' ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <User className="h-3 w-3" />
        User
      </Badge>
    );

  const planBadge = (plan) => {
    if (!plan) return <span className="text-xs text-muted-foreground">None</span>;
    const label = PLAN_LABELS[plan?.toLowerCase()] || plan;
    return <Badge variant={PLAN_COLORS[plan?.toLowerCase()] || 'outline'}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-0.5">
            Manage user accounts and roles
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="secondary">Total: {users.length}</Badge>
        <Badge variant="destructive">
          Admins: {users.filter((u) => u.role === 'ADMIN').length}
        </Badge>
        <Badge className="bg-green-600 text-white">
          Active subs: {users.filter((u) => u.has_active_subscription).length}
        </Badge>
      </div>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No users found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-card"
                >
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      {roleBadge(user.role)}
                      {user.id === me?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {user.total_detections} detection
                        {user.total_detections !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Subscription info */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      {planBadge(user.subscription_plan)}
                    </div>
                    {user.has_active_subscription && user.daily_limit != null && (
                      <p className="text-xs text-muted-foreground">
                        {user.daily_used}/{user.daily_limit} today
                      </p>
                    )}
                    {!user.has_active_subscription && (
                      <span className="text-xs text-muted-foreground">
                        No subscription
                      </span>
                    )}
                  </div>

                  {/* Role toggle */}
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}
                      disabled={updating === user.id || user.id === me?.id}
                      onClick={() => handleRoleToggle(user)}
                    >
                      {updating === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : user.role === 'ADMIN' ? (
                        'Revoke Admin'
                      ) : (
                        'Make Admin'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
