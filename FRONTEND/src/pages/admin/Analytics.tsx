import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  MessageSquare, 
  Ticket, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced with real API calls
  const [analyticsData, setAnalyticsData] = useState({
    userMetrics: {
      totalUsers: 1247,
      activeUsers: 892,
      newRegistrations: 45,
      userGrowthRate: 12.5
    },
    communicationMetrics: {
      totalMessages: 3421,
      averageResponseTime: 2.3,
      appointmentBookings: 156,
      ticketResolutionRate: 87.5
    },
    engagementMetrics: {
      dailyActiveUsers: 234,
      featureUsage: [
        { name: 'Chat', usage: 85 },
        { name: 'Tickets', usage: 67 },
        { name: 'Appointments', usage: 45 },
        { name: 'Announcements', usage: 78 }
      ],
      peakHours: [
        { hour: '9AM', users: 120 },
        { hour: '10AM', users: 180 },
        { hour: '11AM', users: 220 },
        { hour: '12PM', users: 200 },
        { hour: '1PM', users: 150 },
        { hour: '2PM', users: 190 },
        { hour: '3PM', users: 240 },
        { hour: '4PM', users: 210 }
      ]
    },
    performanceMetrics: {
      systemUptime: 99.8,
      errorRate: 0.2,
      averageLoadTime: 1.2
    }
  });

  const userGrowthData = [
    { date: '2024-01-01', users: 1100 },
    { date: '2024-01-02', users: 1120 },
    { date: '2024-01-03', users: 1140 },
    { date: '2024-01-04', users: 1165 },
    { date: '2024-01-05', users: 1180 },
    { date: '2024-01-06', users: 1200 },
    { date: '2024-01-07', users: 1247 }
  ];

  const ticketData = [
    { status: 'Open', count: 23, color: '#3B82F6' },
    { status: 'In Progress', count: 45, color: '#F59E0B' },
    { status: 'Resolved', count: 133, color: '#10B981' },
    { status: 'Closed', count: 67, color: '#6B7280' }
  ];

  const messageVolumeData = [
    { day: 'Mon', messages: 450 },
    { day: 'Tue', messages: 520 },
    { day: 'Wed', messages: 480 },
    { day: 'Thu', messages: 600 },
    { day: 'Fri', messages: 580 },
    { day: 'Sat', messages: 320 },
    { day: 'Sun', messages: 280 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-primary' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border text-muted-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatNumber(analyticsData.userMetrics.totalUsers)}</div>
            <div className="flex items-center text-xs mt-1">
              <span className={getChangeColor(analyticsData.userMetrics.userGrowthRate)}>
                {getChangeIcon(analyticsData.userMetrics.userGrowthRate)}
                +{analyticsData.userMetrics.userGrowthRate}%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatNumber(analyticsData.userMetrics.activeUsers)}</div>
            <div className="flex items-center text-xs mt-1">
              <span className="text-primary">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +8.2%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatNumber(analyticsData.communicationMetrics.totalMessages)}</div>
            <div className="flex items-center text-xs mt-1">
              <span className="text-primary">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +15.3%
              </span>
              <span className="text-muted-foreground ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.communicationMetrics.averageResponseTime}h</div>
            <div className="flex items-center text-xs mt-1">
              <span className="text-primary">
                <TrendingDown className="w-3 h-3 inline mr-1" />
                -12.5%
              </span>
              <span className="text-muted-foreground ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Ticket Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={ticketData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Daily Message Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="messages" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Usage Hours */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Peak Usage Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.engagementMetrics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="users" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.engagementMetrics.featureUsage.map((feature) => (
                <div key={feature.name} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{feature.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-input rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${feature.usage}%` }}
                      />
                    </div>
                    <span className="text-foreground text-sm w-12">{feature.usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">System Uptime</span>
                </div>
                <span className="text-foreground font-semibold">{analyticsData.performanceMetrics.systemUptime}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-muted-foreground">Error Rate</span>
                </div>
                <span className="text-foreground font-semibold">{analyticsData.performanceMetrics.errorRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-muted-foreground">Avg Load Time</span>
                </div>
                <span className="text-foreground font-semibold">{analyticsData.performanceMetrics.averageLoadTime}s</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket Resolution Rate</span>
                  <Badge className="bg-primary text-foreground">
                    {analyticsData.communicationMetrics.ticketResolutionRate}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;