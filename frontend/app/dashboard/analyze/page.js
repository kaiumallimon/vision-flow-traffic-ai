'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ImageUpload from '@/components/ImageUpload';
import { useSubscription } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function AnalyzePage() {
  const { user } = useAuth();
  const {
    getSubscriptionStatus,
    createPaymentOrder,
    getMyOrders,
    loading,
  } = useSubscription();
  const [subscription, setSubscription] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    plan_name: 'Monthly Pro',
    amount_bdt: '',
    bkash_number: '',
    transaction_id: '',
    user_note: '',
  });

  const refreshData = async () => {
    try {
      const [statusData, orderData] = await Promise.all([
        getSubscriptionStatus(),
        getMyOrders(),
      ]);
      setSubscription(statusData);
      setOrders(orderData);
    } catch {
      setSubscription({ has_active_subscription: false });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!formData.amount_bdt || Number(formData.amount_bdt) <= 0) {
      setSubmitError('Please enter a valid amount in BDT.');
      return;
    }

    try {
      await createPaymentOrder({
        ...formData,
        amount_bdt: Number(formData.amount_bdt),
      });
      setFormData((prev) => ({
        ...prev,
        amount_bdt: '',
        bkash_number: '',
        transaction_id: '',
        user_note: '',
      }));
      await refreshData();
    } catch (error) {
      if (error?.response?.data?.detail) {
        setSubmitError(error.response.data.detail);
      } else {
        setSubmitError('Unable to submit payment order.');
      }
    }
  };

  const statusBadge = (status) => {
    if (status === 'APPROVED') return <Badge className="bg-green-600">Approved</Badge>;
    if (status === 'REJECTED') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (pageLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading subscription...
      </div>
    );
  }

  const isActive = !!subscription?.has_active_subscription;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyze Image</h1>
        <p className="text-muted-foreground mt-1">
          Upload and detect traffic objects with AI
        </p>
      </div>

      {isActive ? (
        <>
          <Alert className="border-green-200 bg-green-50">
            <ShieldCheck className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-800">
              Subscription active: <strong>{subscription.plan_name}</strong> (valid until{' '}
              {new Date(subscription.end_at).toLocaleDateString()})
            </AlertDescription>
          </Alert>
          <ImageUpload email={user?.email} />
        </>
      ) : (
        <div className="space-y-6">
          <Card className="border-dashed opacity-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Service Locked
              </CardTitle>
              <CardDescription>
                Image analysis is available after payment verification by admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pointer-events-none rounded-md border bg-muted/50 p-6 text-muted-foreground">
                Analyze service is disabled until your order is approved.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit bKash Payment Info</CardTitle>
              <CardDescription>
                Enter your payment details. Currency is fixed to BDT.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmitOrder}>
                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Plan Name</label>
                    <Input
                      value={formData.plan_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, plan_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (BDT)</label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.amount_bdt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount_bdt: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">bKash Number</label>
                    <Input
                      value={formData.bkash_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bkash_number: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Transaction ID</label>
                    <Input
                      value={formData.transaction_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, transaction_id: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Note (optional)</label>
                  <Input
                    value={formData.user_note}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user_note: e.target.value }))}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Submit Payment Order
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Payment Orders</CardTitle>
              <CardDescription>Track approval status from admin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{order.plan_name} - {order.amount_bdt} BDT</p>
                      <p className="text-xs text-muted-foreground">
                        TX: {order.transaction_id} • {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    {statusBadge(order.status)}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
