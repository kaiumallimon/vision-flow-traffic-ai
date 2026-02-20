'use client';

import { useEffect, useState } from 'react';
import { useAdminStats, useAdminOrders } from '@/lib/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Camera,
  CreditCard,
  Clock,
  TrendingUp,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const { getStats, loading, error } = useAdminStats();
  const { getOrders } = useAdminOrders();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, orders] = await Promise.all([
          getStats(),
          getOrders('PENDING'),
        ]);
        setStats(s);
        setRecentOrders(orders.slice(0, 5));
      } catch {
        // errors handled in hooks
      }
    };
    load();
  }, []);

  const statCards = stats
    ? [
        {
          title: 'Total Users',
          value: stats.total_users,
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
        },
        {
          title: 'Total Detections',
          value: stats.total_detections,
          icon: Camera,
          color: 'text-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-950/20',
        },
        {
          title: 'Revenue (BDT)',
          value: `৳${stats.total_revenue_bdt.toLocaleString()}`,
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-950/20',
        },
        {
          title: 'Pending Orders',
          value: stats.pending_orders,
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-50 dark:bg-orange-950/20',
          link: '/admin/dashboard/orders',
          badge: stats.pending_orders > 0 ? 'action-needed' : null,
        },
        {
          title: 'Active Subscriptions',
          value: stats.active_subscriptions,
          icon: CreditCard,
          color: 'text-teal-600',
          bg: 'bg-teal-50 dark:bg-teal-950/20',
        },
      ]
    : [];

  const planBadgeColor = (plan) => {
    if (!plan) return 'secondary';
    const p = plan.toLowerCase();
    if (p === 'ultimate') return 'default';
    if (p === 'pro') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">
            System overview and management
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats grid */}
      {loading && !stats ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading stats...
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <Card
              key={card.title}
              className={card.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            >
              <CardContent className="pt-6">
                <Link href={card.link || '#'} className={card.link ? '' : 'pointer-events-none'}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-3xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                  {card.badge === 'action-needed' && (
                    <Badge variant="destructive" className="mt-3 text-xs">
                      Needs review
                    </Badge>
                  )}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Orders preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Latest orders awaiting review</CardDescription>
          </div>
          <Link
            href="/admin/dashboard/orders"
            className="text-xs text-primary hover:underline"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending orders. All caught up!
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {order.user_name}{' '}
                      <span className="text-muted-foreground text-xs">
                        ({order.user_email})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.plan_name} • ৳{order.amount_bdt} •{' '}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={planBadgeColor(order.plan_name)}>
                    {order.plan_name}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/dashboard/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-orange-600" />
                Manage Orders
              </CardTitle>
              <CardDescription>
                Review and approve bKash payment submissions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/dashboard/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-blue-600" />
                Manage Users
              </CardTitle>
              <CardDescription>
                View all users, subscriptions and change roles
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
