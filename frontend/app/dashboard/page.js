'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ImageIcon, TrendingUp, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { getStats, loading } = useStats();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchStats(user.email);
    }
  }, [user]);

  const fetchStats = async (email) => {
    try {
      const data = await getStats(email);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const detectionsDates = stats?.detectionsByDate
    ? Object.entries(stats.detectionsByDate)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          detections: count,
        }))
    : [];

  const mostCommonData = stats?.mostCommonObjects
    ? Object.entries(stats.mostCommonObjects).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: count,
      }))
    : [];

  const statCards = [
    {
      title: 'Total Detections',
      value: stats?.totalDetections || 0,
      icon: ImageIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Most Common',
      value: mostCommonData[0]?.name || 'N/A',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Recent Activity',
      value: stats?.recentDetections || 0,
      icon: Activity,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'AI Insights',
      value: 'Active',
      icon: Zap,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-slate-600 mt-2">
          Here's your traffic detection analytics overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detections by Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detections Over Time</CardTitle>
            <CardDescription>
              Last 7 days of detection activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={detectionsDates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="detections"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Detections"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Most Common Objects */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Objects</CardTitle>
            <CardDescription>
              Detection frequency distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : mostCommonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mostCommonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mostCommonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <p>No detection data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to analyze?</h3>
              <p className="text-blue-100 mt-1">
                Upload a traffic image to get AI-powered insights
              </p>
            </div>
            <a href="/dashboard/analyze" className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Get Started
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
