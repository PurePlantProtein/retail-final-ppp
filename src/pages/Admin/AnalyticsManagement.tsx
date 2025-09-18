
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
  const { orders: rawOrders, clearAllOrders } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [productRows, setProductRows] = useState<Array<{id:string; name:string; units:number; revenue:number; orders:number}>>([]);
  const [timeRange, setTimeRange] = useState('last30days');
  
  // Fetch filtered metrics (excludes samples + admin orders by default)
  useEffect(() => {
    const loadMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const qs = new URLSearchParams();
        // Later: respect timeRange by approximating days
        if (timeRange === 'last7days') qs.set('days','7');
        if (timeRange === 'last30days') qs.set('days','30');
        if (timeRange === 'last90days') qs.set('days','90');
        if (timeRange === 'thisYear') {
          const startYear = new Date(new Date().getFullYear(),0,1);
          const diffDays = Math.ceil((Date.now() - startYear.getTime())/ (1000*60*60*24));
          qs.set('days', String(diffDays));
        }
        const res = await fetch(`/api/admin/metrics/orders?${qs.toString()}` , {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
          }
        });
        const body = await res.json();
        if (!res.ok || body.error) throw new Error(body.error || 'Failed to load metrics');
        const raw = body.data.orders || [];
        // Normalize shape similar to normalizeOrder (minimal): createdAt, items parsed
        const normalized = raw.map((o:any) => {
          let items = o.items;
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
          }
          return {
            ...o,
            createdAt: o.created_at || o.createdAt,
            total: Number(o.total) || 0,
            items: Array.isArray(items) ? items : []
          };
        });
        setFilteredOrders(normalized);
      } catch (e:any) {
        console.error('metrics load failed', e);
        setMetricsError(e.message || 'Metrics load failed');
        // fallback: use existing raw orders (client side filter quick)
        try {
          const fallback = (rawOrders || []).filter(o => !o.id.startsWith('ADMIN-') && !(o.is_sample));
          setFilteredOrders(fallback);
        } catch {}
      } finally {
        setMetricsLoading(false);
      }
    };
    loadMetrics();
  }, [timeRange, rawOrders]);

  // Prepare data for charts using filteredOrders
  const ordersByDate = {};
  const ordersByStatus = {};
  const productPopularity = {};
  
  // Process orders for charts
  filteredOrders.forEach(order => {
    // Process for date-based chart
    const date = new Date(order.createdAt).toLocaleDateString();
    ordersByDate[date] = (ordersByDate[date] || 0) + 1;
    
    // Process for status chart
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    
    // Process for product popularity
    order.items.forEach(item => {
      const productName = item.product?.name || item.name || 'Unknown';
      productPopularity[productName] = (productPopularity[productName] || 0) + (item.quantity || 0);
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
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total)||0), 0);
  
  // Calculate average order value
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  // Build product sold rows (units + revenue + order count)
  useEffect(() => {
    const map: Record<string, { id:string; name:string; units:number; revenue:number; orders:Set<string> }> = {};
    for (const o of filteredOrders) {
      const oid = o.id;
      (o.items || []).forEach((it:any) => {
        const p = it.product || {};
        const name = p.name || it.name || 'Unknown';
        const id = String(p.id || it.product_id || name);
        const qty = Number(it.quantity)||0;
        const unitPrice = Number(it.unit_price ?? p.price ?? it.price ?? 0);
        if (!map[id]) map[id] = { id, name, units:0, revenue:0, orders:new Set() };
        map[id].units += qty;
        map[id].revenue += qty * unitPrice;
        map[id].orders.add(oid);
      });
    }
    const rows = Object.values(map)
      .map(r => ({ id: r.id, name: r.name, units: r.units, revenue: r.revenue, orders: r.orders.size }))
      .sort((a,b)=> b.units - a.units || b.revenue - a.revenue);
    setProductRows(rows);
  }, [filteredOrders]);
  
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
                <CardTitle className="text-3xl">{metricsLoading ? '...' : filteredOrders.length}</CardTitle>
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
                  From {filteredOrders.length} orders {metricsLoading && '(loading...)'}
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
                  {metricsLoading ? 'Loading...' : averageOrderValue > 0 ? `Avg trend est: +${(averageOrderValue * 0.05).toFixed(2)}%` : '0%'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time {metricsLoading && '(loading)'}</CardTitle>
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
                <CardTitle>Order Status Distribution {metricsLoading && '(loading)'}</CardTitle>
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
              <CardTitle>Top Selling Products {metricsLoading && '(loading)'}</CardTitle>
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

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Products Sold (Detailed)</CardTitle>
              {metricsError && <CardDescription className="text-destructive">{metricsError}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Units</th>
                      <th className="py-2 pr-4">Revenue</th>
                      <th className="py-2 pr-4">Orders</th>
                      <th className="py-2 pr-4">Avg Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.length === 0 && !metricsLoading && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">No product sales in selected range.</td>
                      </tr>
                    )}
                    {productRows.map(row => {
                      const avg = row.units ? row.revenue / row.units : 0;
                      return (
                        <tr key={row.id} className="border-b last:border-none hover:bg-muted/30">
                          <td className="py-2 pr-4 font-medium">{row.name}</td>
                          <td className="py-2 pr-4">{row.units}</td>
                          <td className="py-2 pr-4">{formatCurrency(row.revenue)}</td>
                          <td className="py-2 pr-4">{row.orders}</td>
                          <td className="py-2 pr-4">{formatCurrency(avg)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </Layout>
  );
};

export default AnalyticsManagement;
