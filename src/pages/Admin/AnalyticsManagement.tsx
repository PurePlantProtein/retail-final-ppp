
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingBag
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

// Import Recharts components
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

// Sample data for charts
const generateSalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.map((month, i) => {
    const baseSales = Math.floor(Math.random() * 10000) + 5000;
    // Make current month and previous 2 months have realistic data
    const sales = i >= currentMonth - 2 && i <= currentMonth 
      ? baseSales * 1.5 
      : i > currentMonth ? 0 : baseSales;
      
    return {
      name: month,
      sales: sales,
      previous: i < currentMonth ? Math.floor(baseSales * 0.8) : 0,
    };
  });
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const categoryData = [
  { name: 'Protein Powders', value: 45 },
  { name: 'Plant Protein', value: 25 },
  { name: 'Supplements', value: 15 },
  { name: 'Vegan', value: 10 },
  { name: 'Other', value: 5 },
];

const recentOrders = [
  { id: 'ORD-7291', customer: 'F45 Training', amount: 1245.99, status: 'completed', date: '2025-05-20' },
  { id: 'ORD-7290', customer: 'Urban Fitness', amount: 842.50, status: 'processing', date: '2025-05-19' },
  { id: 'ORD-7289', customer: 'Elite Nutrition', amount: 2100.00, status: 'completed', date: '2025-05-18' },
  { id: 'ORD-7288', customer: 'Vegan Life Co', amount: 567.25, status: 'completed', date: '2025-05-17' },
];

const AnalyticsManagement = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      setSalesData(generateSalesData());
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, isAdmin, navigate, toast]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };

  // Calculate summary metrics
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const previousTotalSales = salesData.reduce((sum, item) => sum + (item.previous || 0), 0);
  const salesGrowth = previousTotalSales ? ((totalSales - previousTotalSales) / previousTotalSales) * 100 : 0;
  const averageOrderValue = totalSales / 87; // Assume 87 orders for demo
  const conversionRate = 4.2; // Percentage for demo

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Monitor your business performance and sales trends</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                        <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalSales)}</h3>
                      </div>
                      <div className={`p-2 rounded-full ${salesGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {salesGrowth >= 0 ? (
                          <ArrowUpRight className="h-6 w-6 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className={`text-sm font-medium ${salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {salesGrowth.toFixed(1)}%
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Orders</p>
                        <h3 className="text-2xl font-bold mt-1">87</h3>
                      </div>
                      <div className="p-2 rounded-full bg-blue-100">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm font-medium text-green-600">+12.3%</span>
                      <span className="text-sm text-muted-foreground ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                        <h3 className="text-2xl font-bold mt-1">{formatCurrency(averageOrderValue)}</h3>
                      </div>
                      <div className="p-2 rounded-full bg-purple-100">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm font-medium text-green-600">+5.2%</span>
                      <span className="text-sm text-muted-foreground ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                        <h3 className="text-2xl font-bold mt-1">42</h3>
                      </div>
                      <div className="p-2 rounded-full bg-amber-100">
                        <Users className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm font-medium text-green-600">+8.7%</span>
                      <span className="text-sm text-muted-foreground ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main content tabs */}
              <Tabs defaultValue="overview" className="mb-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Sales over time chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ChartContainer config={{ sales: {}, previous: {} }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={salesData}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                              <Tooltip content={(props) => (
                                <ChartTooltipContent {...props} formatter={(value) => formatCurrency(value)} />
                              )} />
                              <Area 
                                type="monotone" 
                                dataKey="previous" 
                                name="Previous" 
                                stroke="#9CA3AF" 
                                fill="#E5E7EB" 
                                strokeWidth={2} 
                                activeDot={{ r: 6 }} 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="sales" 
                                name="Current" 
                                stroke="#2563EB" 
                                fill="#DBEAFE" 
                                strokeWidth={2} 
                                activeDot={{ r: 8 }} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product category distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ChartContainer config={{}}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={categoryData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Recent orders */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-2 border-b last:border-0">
                              <div>
                                <p className="font-medium">{order.id}</p>
                                <p className="text-sm text-muted-foreground">{order.customer}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(order.amount)}</p>
                                <Badge variant={order.status === 'completed' ? 'outline' : 'secondary'}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="link" className="w-full mt-4">
                          View all orders
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="sales" className="space-y-4 mt-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Detailed Sales Analytics</h3>
                    <p>This tab will contain more detailed sales analytics and reports.</p>
                  </Card>
                </TabsContent>
                
                <TabsContent value="products" className="space-y-4 mt-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Product Performance</h3>
                    <p>This tab will contain detailed product performance analytics.</p>
                  </Card>
                </TabsContent>
                
                <TabsContent value="customers" className="space-y-4 mt-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Customer Analytics</h3>
                    <p>This tab will contain customer analytics and insights.</p>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default AnalyticsManagement;
