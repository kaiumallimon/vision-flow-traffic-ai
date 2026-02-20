'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminOrders } from '@/lib/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ClipboardList } from 'lucide-react';

const PLAN_LABELS = {
  basic: 'Basic',
  pro: 'Pro',
  ultimate: 'Ultimate',
};

export default function AdminOrdersPage() {
  const { getOrders, reviewOrder, loading } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [adminNoteByOrder, setAdminNoteByOrder] = useState({});
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setError('');
    try {
      const data = await getOrders(statusFilter);
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const groupedCounts = useMemo(() => {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleReview = async (orderId, action) => {
    try {
      await reviewOrder(orderId, {
        action,
        admin_note: adminNoteByOrder[orderId] || '',
      });
      await fetchOrders();
    } catch {
      // handled by hook
    }
  };

  const statusBadge = (s) => {
    if (s === 'APPROVED') return <Badge className="bg-green-600 text-white">Approved</Badge>;
    if (s === 'REJECTED') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  const planBadge = (name) => {
    const label = PLAN_LABELS[name?.toLowerCase()] || name;
    const variants = { basic: 'outline', pro: 'secondary', ultimate: 'default' };
    return <Badge variant={variants[name?.toLowerCase()] || 'outline'}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">Payment Orders</h1>
          <p className="text-muted-foreground mt-0.5">
            Review and approve bKash payment submissions
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status overview */}
      <Card>
        <CardHeader>
          <CardTitle>Order Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Badge variant="secondary">Pending: {groupedCounts.PENDING}</Badge>
          <Badge className="bg-green-600 text-white">Approved: {groupedCounts.APPROVED}</Badge>
          <Badge variant="destructive">Rejected: {groupedCounts.REJECTED}</Badge>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>Filter by status and take action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? 'default' : 'outline'}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No {statusFilter.toLowerCase()} orders found.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border p-4 space-y-3 bg-card"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-0.5">
                      <p className="font-semibold">
                        {order.user_name}{' '}
                        <span className="text-muted-foreground font-normal text-sm">
                          ({order.user_email})
                        </span>
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {planBadge(order.plan_name)}
                        <span className="text-sm text-muted-foreground">
                          ৳{order.amount_bdt} {order.currency}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        bKash: {order.bkash_number} • TX:{' '}
                        <span className="font-mono">{order.transaction_id}</span>
                      </p>
                      {order.user_note && (
                        <p className="text-xs text-muted-foreground italic">
                          Note: {order.user_note}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    {statusBadge(order.status)}
                  </div>

                  {/* Admin note + actions */}
                  {order.status === 'PENDING' && (
                    <>
                      <Input
                        placeholder="Admin note (optional)"
                        value={adminNoteByOrder[order.id] || ''}
                        onChange={(e) =>
                          setAdminNoteByOrder((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleReview(order.id, 'approve')}
                          disabled={loading}
                        >
                          Approve (30 days)
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(order.id, 'reject')}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Show admin note if reviewed */}
                  {order.admin_note && order.status !== 'PENDING' && (
                    <p className="text-xs text-muted-foreground bg-muted rounded p-2">
                      Admin note: {order.admin_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
