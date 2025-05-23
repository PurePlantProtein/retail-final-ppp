
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useOrders } from '@/hooks/useOrders';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

const AnalyticsManagement = () => {
  const { toast } = useToast();
  const { orders, clearAllOrders } = useOrders();
  const [timeRange, setTimeRange] = useState('last30days');
  
  // Prepare data for charts
  const ordersByDate = {};
  const ordersByStatus = {};
  const productPopularity = {};
  
  // Process orders for charts
  orders.forEach(order => {
    // Process for date-based chart
    const date = new Date(order.createdAt).toLocaleDateString();
    ordersByDate[date] = (ordersByDate[date] || 0) + 1;
    
    // Process for status chart
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    
    // Process for product popularity
    order.items.forEach(item => {
      const productName = item.product.name;
      productPopularity[productName] = (productPopularity[productName] || 0) + item.quantity;
    });
  });
  
  // Convert to arrays for charts
  const ordersDateData = Object.keys(ordersByDate).map(date => ({
    date,
    orders: ordersByDate[date]
  }));
  
  const ordersStatusData = Object.keys(ordersByStatus).map(status => ({
    status,
    value: ordersByStatus[status]
  }));
  
  const productData = Object.keys(productPopularity)
    .map(name => ({
      name,
      value: productPopularity[name]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Calculate average order value
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all order data? This action cannot be undone.')) {
      clearAllOrders();
    }
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            
            <div className="flex gap-4">
              <Button 
                variant="destructive"
                onClick={handleClearData}
              >
                Clear All Order Data
              </Button>
              
              <Select 
                value={timeRange} 
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{orders.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {timeRange === 'last7days' ? 'Last 7 days' : 
                   timeRange === 'last30days' ? 'Last 30 days' : 
                   timeRange === 'last90days' ? 'Last 90 days' : 
                   timeRange === 'thisYear' ? 'This year' : 'All time'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-3xl">{formatCurrency(totalRevenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From {orders.length} orders
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Order Value</CardDescription>
                <CardTitle className="text-3xl">{formatCurrency(averageOrderValue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {averageOrderValue > 0 ? `+${(averageOrderValue * 0.05).toFixed(2)}%` : '0%'} from last period
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ordersDateData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#25a18e" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ordersStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Units Sold" fill="#25a18e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default AnalyticsManagement;
