import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AnalyticsDashboard({ user, vendorProfile }) {
  const [analytics, setAnalytics] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    yesterdayRevenue: 0,
    yesterdayOrders: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    topItems: [],
    recentOrders: [],
    hourlyData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];

      // Today's stats
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .gte('created_at', today + 'T00:00:00')
        .eq('payment_status', 'paid');

      // Yesterday's stats
      const { data: yesterdayOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .gte('created_at', yesterday + 'T00:00:00')
        .lt('created_at', today + 'T00:00:00')
        .eq('payment_status', 'paid');

      // Week stats
      const { data: weekOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .gte('created_at', weekAgo + 'T00:00:00')
        .eq('payment_status', 'paid');

      // Month stats
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .gte('created_at', monthAgo + 'T00:00:00')
        .eq('payment_status', 'paid');

      // Top selling items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_items (name),
          orders!inner (vendor_id, payment_status)
        `)
        .eq('orders.vendor_id', user.id)
        .eq('orders.payment_status', 'paid')
        .gte('orders.created_at', weekAgo + 'T00:00:00');

      // Recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          *,
          customers (phone)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate analytics
      const todayRevenue = todayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const weekRevenue = weekOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const monthRevenue = monthOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      const avgOrderValue = todayOrders?.length > 0 ? todayRevenue / todayOrders.length : 0;

      // Top items calculation
      const itemCounts = {};
      orderItems?.forEach(item => {
        const name = item.menu_items?.name || 'Unknown';
        itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
      });
      
      const topItems = Object.entries(itemCounts)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setAnalytics({
        todayRevenue,
        todayOrders: todayOrders?.length || 0,
        yesterdayRevenue,
        yesterdayOrders: yesterdayOrders?.length || 0,
        weekRevenue,
        monthRevenue,
        totalCustomers: new Set(monthOrders?.map(o => o.customer_id)).size,
        avgOrderValue,
        topItems,
        recentOrders: recentOrders || []
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRevenueChange = () => {
    if (analytics.yesterdayRevenue === 0) return { percentage: 0, isPositive: true };
    const change = ((analytics.todayRevenue - analytics.yesterdayRevenue) / analytics.yesterdayRevenue) * 100;
    return { percentage: Math.abs(change), isPositive: change >= 0 };
  };

  const getOrdersChange = () => {
    if (analytics.yesterdayOrders === 0) return { percentage: 0, isPositive: true };
    const change = ((analytics.todayOrders - analytics.yesterdayOrders) / analytics.yesterdayOrders) * 100;
    return { percentage: Math.abs(change), isPositive: change >= 0 };
  };

  const revenueChange = getRevenueChange();
  const ordersChange = getOrdersChange();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {/* Key Metrics */}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-xl-3 col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-gradient rounded-3 d-flex align-items-center justify-content-center me-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span className="text-white fs-4">💰</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-muted small">Today's Revenue</div>
                    <div className="fs-3 fw-bold text-success">${analytics.todayRevenue.toFixed(2)}</div>
                    <div className="small">
                      <span className={`badge ${revenueChange.isPositive ? 'bg-success' : 'bg-danger'}`}>
                        {revenueChange.isPositive ? '↗' : '↘'} {revenueChange.percentage.toFixed(1)}%
                      </span>
                      <span className="text-muted ms-1">vs yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-gradient rounded-3 d-flex align-items-center justify-content-center me-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span className="text-white fs-4">📋</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-muted small">Today's Orders</div>
                    <div className="fs-3 fw-bold text-primary">{analytics.todayOrders}</div>
                    <div className="small">
                      <span className={`badge ${ordersChange.isPositive ? 'bg-success' : 'bg-danger'}`}>
                        {ordersChange.isPositive ? '↗' : '↘'} {ordersChange.percentage.toFixed(1)}%
                      </span>
                      <span className="text-muted ms-1">vs yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-gradient rounded-3 d-flex align-items-center justify-content-center me-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span className="text-white fs-4">👥</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-muted small">Monthly Customers</div>
                    <div className="fs-3 fw-bold text-warning">{analytics.totalCustomers}</div>
                    <div className="small text-muted">Unique customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-gradient rounded-3 d-flex align-items-center justify-content-center me-3"
                       style={{ width: '50px', height: '50px' }}>
                    <span className="text-white fs-4">💳</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-muted small">Avg Order Value</div>
                    <div className="fs-3 fw-bold text-info">${analytics.avgOrderValue.toFixed(2)}</div>
                    <div className="small text-muted">Per order today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">📊 Revenue Overview</h5>
            <div className="row g-3">
              <div className="col-6">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="fs-4 fw-bold text-primary">${analytics.weekRevenue.toFixed(2)}</div>
                  <div className="small text-muted">This Week</div>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="fs-4 fw-bold text-success">${analytics.monthRevenue.toFixed(2)}</div>
                  <div className="small text-muted">This Month</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h6 className="fw-semibold mb-3">🔥 Top Selling Items This Week</h6>
              {analytics.topItems.length === 0 ? (
                <p className="text-muted">No sales data available</p>
              ) : (
                analytics.topItems.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-semibold">{item.name}</span>
                    </div>
                    <div>
                      <span className="badge bg-primary">{item.quantity} sold</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">🕐 Recent Orders</h5>
            {analytics.recentOrders.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-muted">No orders yet</div>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {analytics.recentOrders.map((order) => (
                  <div key={order.id} className="list-group-item border-0 px-0">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">Order #{order.order_number}</div>
                        <div className="small text-muted">{order.customers?.phone || 'N/A'}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">${order.total_amount?.toFixed(2)}</div>
                        <div className={`small badge ${
                          order.status === 'completed' ? 'bg-success' :
                          order.status === 'preparing' ? 'bg-warning' :
                          order.status === 'ready' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}