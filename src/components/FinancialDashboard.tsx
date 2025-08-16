import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Users, Ticket, Calendar } from "lucide-react";
import { analyticsAPI, paymentsAPI, financialReportingAPI } from "@/lib/api";

interface FinancialMetrics {
  totalRevenue: number;
  totalTickets: number;
  averageTicketPrice: number;
  revenueGrowth: number;
  topEvents: Array<{
    id: string;
    title: string;
    revenue: number;
    ticketsSold: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    tickets: number;
  }>;
}

interface FinancialDashboardProps {
  userId: string;
  userRole: 'organizer' | 'user';
}

export function FinancialDashboard({ userId, userRole }: FinancialDashboardProps) {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  // Default empty metrics structure
  const defaultMetrics: FinancialMetrics = {
    totalRevenue: 0,
    totalTickets: 0,
    averageTicketPrice: 0,
    revenueGrowth: 0,
    topEvents: [],
    monthlyRevenue: []
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        
        if (userRole === 'organizer') {
          // Fetch organizer-specific financial data with comprehensive reporting
          const [financialSummary, revenueAnalytics, expenseBreakdown] = await Promise.all([
            financialReportingAPI.getFinancialSummary(timeRange),
            analyticsAPI.getRevenueAnalytics(timeRange),
            financialReportingAPI.getExpenseBreakdown(timeRange)
          ]) as any[];

          if (financialSummary?.success && revenueAnalytics?.success) {
            // Combine comprehensive financial data
            const combinedMetrics = {
              ...financialSummary.data,
              topEvents: revenueAnalytics.data?.topEvents || [],
              monthlyRevenue: revenueAnalytics.data?.monthlyRevenue || [],
              expenses: expenseBreakdown.data?.expenses || []
            };
            setMetrics(combinedMetrics);
          } else {
            // Fallback to basic analytics data
            const [revenueResponse, breakdownResponse, trendsResponse] = await Promise.all([
              analyticsAPI.getRevenueAnalytics(timeRange),
              analyticsAPI.getRevenueBreakdown(undefined, timeRange),
              analyticsAPI.getRevenueTrends(timeRange, 'daily')
            ]) as any[];

            if (revenueResponse?.success && breakdownResponse?.success && trendsResponse?.success) {
              const combinedMetrics = {
                ...revenueResponse.data,
                topEvents: breakdownResponse.data.topEvents || [],
                monthlyRevenue: trendsResponse.data.monthlyRevenue || []
              };
              setMetrics(combinedMetrics);
            } else {
              // Final fallback to basic revenue data
              const basicResponse = await analyticsAPI.getUserRevenue() as any;
              if (basicResponse && basicResponse.success) {
                setMetrics(basicResponse.data);
              } else {
                setMetrics(defaultMetrics);
              }
            }
          }
        } else {
          // Fetch user-specific financial data
          const response = await paymentsAPI.getPaymentHistory() as any;
          if (response && response.success) {
            // Transform payment history to financial metrics
            const userMetrics = transformPaymentHistoryToMetrics(response.payments);
            setMetrics(userMetrics);
          } else {
            setMetrics(defaultMetrics); // Fallback to empty data
          }
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setMetrics(defaultMetrics); // Fallback to empty data
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [userId, userRole, timeRange]);

  const transformPaymentHistoryToMetrics = (payments: any[]): FinancialMetrics => {
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalTickets = payments.length;
    const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

    return {
      totalRevenue,
      totalTickets,
      averageTicketPrice,
      revenueGrowth: 0, // Calculate from historical data
      topEvents: [], // Group by event
      monthlyRevenue: [] // Group by month
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No financial data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            {userRole === 'organizer' ? 'Track your event revenue and performance' : 'Monitor your spending and ticket purchases'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(metrics.revenueGrowth)}`}>
              {React.createElement(getGrowthIcon(metrics.revenueGrowth), { className: "h-3 w-3 mr-1" })}
              {metrics.revenueGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Avg. price: {formatCurrency(metrics.averageTicketPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageTicketPrice)}</div>
            <p className="text-xs text-muted-foreground">
              Per ticket
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGrowthColor(metrics.revenueGrowth)}`}>
              {metrics.revenueGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>
            Events with highest revenue and ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topEvents.map((event, index) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.ticketsSold} tickets sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(event.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(event.revenue / event.ticketsSold)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>
            Revenue and ticket sales over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.monthlyRevenue.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{month.month}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tickets</p>
                    <p className="font-medium">{month.tickets}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-bold text-primary">{formatCurrency(month.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
