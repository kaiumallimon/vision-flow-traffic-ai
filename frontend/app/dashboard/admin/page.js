'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAdminOrders } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { getOrders, reviewOrder, loading } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [adminNoteByOrder, setAdminNoteByOrder] = useState({});
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const fetchOrders = async () => {
    if (!isAdmin) return;
    setError('');
    try {
      const data = await getOrders(statusFilter);
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load admin orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, isAdmin]);

  const groupedCounts = useMemo(() => {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleReview = async (orderId, action) => {
    try {
      await reviewOrder(orderId, {
        action,
        admin_note: adminNoteByOrder[orderId] || '',
        duration_days: 30,
      });
      await fetchOrders();
    } catch {
      // handled by hook toast + error state
    }
  };

  const statusBadge = (status) => {
    if (status === 'APPROVED') return <Badge className="bg-green-600">Approved</Badge>;
    if (status === 'REJECTED') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Admin Access Required
          </CardTitle>
          <CardDescription>You do not have permission to manage orders.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Orders</h1>
        <p className="text-muted-foreground mt-1">Review payment orders and approve subscriptions.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Badge variant="secondary">Pending: {groupedCounts.PENDING}</Badge>
          <Badge className="bg-green-600">Approved: {groupedCounts.APPROVED}</Badge>
          <Badge variant="destructive">Rejected: {groupedCounts.REJECTED}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>Filter and review submitted bKash transactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found for this status.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.user_name} ({order.user_email})</p>
                      <p className="text-sm text-muted-foreground">
                        {order.plan_name} • {order.amount_bdt} {order.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        bKash: {order.bkash_number} • TX: {order.transaction_id}
                      </p>
                    </div>
                    {statusBadge(order.status)}
                  </div>

                  <Input
                    placeholder="Admin note (optional)"
                    value={adminNoteByOrder[order.id] || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setAdminNoteByOrder((prev) => ({ ...prev, [order.id]: value }));
                    }}
                  />

                  {order.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <Button onClick={() => handleReview(order.id, 'approve')}>Approve</Button>
                      <Button variant="destructive" onClick={() => handleReview(order.id, 'reject')}>
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
