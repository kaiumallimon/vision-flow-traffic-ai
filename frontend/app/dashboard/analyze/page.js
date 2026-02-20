'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ImageUpload from '@/components/ImageUpload';
import { useSubscription, useSubscriptionPlans } from '@/lib/hooks';
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
import { Progress } from '@/components/ui/progress';
import { Loader2, Lock, ShieldCheck, Check, Zap, Star, Crown } from 'lucide-react';

// Static plan config as fallback
const DEFAULT_PLANS = [
  { name: 'basic',    label: 'Basic',    daily_limit: 10,  price_bdt: 200,   description: '10 image analyses per day', icon: Zap },
  { name: 'pro',      label: 'Pro',      daily_limit: 30,  price_bdt: 1000,  description: '30 image analyses per day', icon: Star },
  { name: 'ultimate', label: 'Ultimate', daily_limit: 100, price_bdt: 8000,  description: '100 image analyses per day', icon: Crown },
];

const PLAN_ICONS = { basic: Zap, pro: Star, ultimate: Crown };
const PLAN_STYLES = {
  basic:    { border: 'border-slate-200', bg: 'bg-slate-50 dark:bg-slate-900/40', badge: 'secondary' },
  pro:      { border: 'border-blue-200',  bg: 'bg-blue-50 dark:bg-blue-900/20',   badge: 'default',   popular: true },
  ultimate: { border: 'border-amber-200', bg: 'bg-amber-50 dark:bg-amber-900/20', badge: 'outline' },
};

export default function AnalyzePage() {
  const { user } = useAuth();
  const { getSubscriptionStatus, createPaymentOrder, getMyOrders, loading } = useSubscription();
  const { getPlans } = useSubscriptionPlans();

  const [subscription, setSubscription]   = useState(null);
  const [orders, setOrders]               = useState([]);
  const [plans, setPlans]                 = useState(DEFAULT_PLANS);
  const [selectedPlan, setSelectedPlan]   = useState(null);
  const [pageLoading, setPageLoading]     = useState(true);
  const [submitError, setSubmitError]     = useState('');
  const [formData, setFormData]           = useState({
    bkash_number:   '',
    transaction_id: '',
    user_note:      '',
  });

  const refreshData = async () => {
    try {
      const [statusData, orderData, planData] = await Promise.all([
        getSubscriptionStatus(),
        getMyOrders(),
        getPlans(),
      ]);
      setSubscription(statusData);
      setOrders(orderData);
      if (planData?.length) setPlans(planData);
    } catch {
      setSubscription({ has_active_subscription: false });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Auto-select first plan
  useEffect(() => {
    if (plans.length && !selectedPlan) {
      setSelectedPlan(plans[0]);
    }
  }, [plans]);

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!selectedPlan) {
      setSubmitError('Please select a plan.');
      return;
    }

    try {
      await createPaymentOrder({
        plan_name:      selectedPlan.name,
        amount_bdt:     selectedPlan.price_bdt,
        bkash_number:   formData.bkash_number,
        transaction_id: formData.transaction_id,
        user_note:      formData.user_note || undefined,
      });
      setFormData({ bkash_number: '', transaction_id: '', user_note: '' });
      await refreshData();
    } catch (error) {
      if (error?.response?.data?.detail) {
        setSubmitError(error.response.data.detail);
      } else {
        setSubmitError('Unable to submit payment order.');
      }
    }
  };

  const statusBadge = (s) => {
    if (s === 'APPROVED') return <Badge className="bg-green-600 text-white">Approved</Badge>;
    if (s === 'REJECTED') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (pageLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  const isActive = !!subscription?.has_active_subscription;
  const dailyUsed  = subscription?.daily_used  ?? 0;
  const dailyLimit = subscription?.daily_limit ?? 0;
  const dailyPct   = dailyLimit > 0 ? Math.round((dailyUsed / dailyLimit) * 100) : 0;
  const usageColor = dailyPct >= 90 ? 'text-red-600' : dailyPct >= 70 ? 'text-orange-500' : 'text-green-600';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyze Image</h1>
        <p className="text-muted-foreground mt-1">
          Upload and detect traffic objects with AI
        </p>
      </div>

      {/* Active subscription view */}
      {isActive ? (
        <>
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <ShieldCheck className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <span className="font-semibold">
                {subscription.plan_name?.charAt(0).toUpperCase() +
                  subscription.plan_name?.slice(1)}{' '}
                Plan
              </span>{' '}
              active — valid until{' '}
              {new Date(subscription.end_at).toLocaleDateString()}
            </AlertDescription>
          </Alert>

          {/* Daily usage meter */}
          {dailyLimit > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Usage</CardTitle>
                <CardDescription>Resets at midnight UTC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analyses used today</span>
                  <span className={`font-semibold ${usageColor}`}>
                    {dailyUsed} / {dailyLimit}
                  </span>
                </div>
                <Progress value={dailyPct} className="h-2" />
                {dailyUsed >= dailyLimit && (
                  <p className="text-xs text-red-600 font-medium">
                    Daily limit reached. Resets at midnight UTC.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <ImageUpload email={user?.email} onSuccess={refreshData} />
        </>
      ) : (
        /* No subscription – show plan selection + payment form */
        <div className="space-y-6">
          {/* Locked card */}
          <Card className="border-dashed opacity-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Service Locked
              </CardTitle>
              <CardDescription>
                Image analysis is available after payment verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pointer-events-none rounded-md border bg-muted/50 p-6 text-muted-foreground text-sm text-center">
                Analyze service unlocks once your order is approved.
              </div>
            </CardContent>
          </Card>

          {/* Plan cards */}
          <div>
            <h2 className="text-xl font-semibold mb-1">Choose a Plan</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All plans are valid for 30 days from the date of approval.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {plans.map((plan) => {
                const style   = PLAN_STYLES[plan.name] || PLAN_STYLES.basic;
                const PlanIcon = PLAN_ICONS[plan.name] || Zap;
                const isSelected = selectedPlan?.name === plan.name;
                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none ${
                      style.bg
                    } ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30'
                        : `${style.border} hover:border-primary/50`
                    }`}
                  >
                    {style.popular && (
                      <span className="absolute -top-2 right-3 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <PlanIcon className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-semibold">{plan.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
                      )}
                    </div>
                    <p className="text-2xl font-bold">
                      ৳{plan.price_bdt.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">per month</p>
                    <p className="text-sm mt-2">{plan.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit bKash Payment</CardTitle>
              <CardDescription>
                {selectedPlan
                  ? `${selectedPlan.label} Plan — ৳${selectedPlan.price_bdt.toLocaleString()} BDT`
                  : 'Select a plan above to see the amount'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmitOrder}>
                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {/* Readonly plan + amount */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Selected Plan
                    </label>
                    <Input value={selectedPlan?.label || '—'} readOnly className="bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Amount (BDT)
                    </label>
                    <Input
                      value={selectedPlan ? `৳${selectedPlan.price_bdt.toLocaleString()}` : '—'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Your bKash Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="01XXXXXXXXX"
                      value={formData.bkash_number}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, bkash_number: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Transaction ID <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. 8N5GH3K..."
                      value={formData.transaction_id}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, transaction_id: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Note (optional)
                  </label>
                  <Input
                    placeholder="Any additional info for admin…"
                    value={formData.user_note}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, user_note: e.target.value }))
                    }
                  />
                </div>

                <Button type="submit" disabled={loading || !selectedPlan} className="w-full sm:w-auto">
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Submit Payment Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My orders */}
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
                  <div
                    key={order.id}
                    className="rounded-md border p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {order.plan_name} — ৳{order.amount_bdt} BDT
                      </p>
                      <p className="text-xs text-muted-foreground">
                        TX: {order.transaction_id} •{' '}
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      {order.admin_note && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          Admin: {order.admin_note}
                        </p>
                      )}
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
