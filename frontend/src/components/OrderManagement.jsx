import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function OrderManagement({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchOrders();
      // Set up real-time subscription for new orders
      const subscription = supabase
        .channel('orders')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders',
            filter: `vendor_id=eq.${user.id}`
          }, 
          () => {
            fetchOrders(); // Refresh orders when there's a change
          }
        )
        .subscribe();

      return () => supabase.removeChannel(subscription);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (phone),
          order_items (
            *,
            menu_items (name, price)
          )
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          ...(newStatus === 'ready' && { estimated_ready_time: new Date() })
        })
        .eq("id", orderId);

      if (error) {
        alert("Error updating order status");
      } else {
        fetchOrders(); // Refresh orders
        
        // In production, you'd send SMS notification here
        if (newStatus === 'ready') {
          console.log(`Would send SMS: "Your order is ready for pickup!"`);
        }
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'confirmed': 'info', 
      'preparing': 'primary',
      'ready': 'success',
      'completed': 'secondary',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusActions = (order) => {
    const actions = [];
    
    if (order.status === 'pending') {
      actions.push(
        <button 
          key="confirm" 
          className="btn btn-sm btn-success me-1"
          onClick={() => updateOrderStatus(order.id, 'confirmed')}
        >
          Accept
        </button>
      );
      actions.push(
        <button 
          key="cancel" 
          className="btn btn-sm btn-danger"
          onClick={() => updateOrderStatus(order.id, 'cancelled')}
        >
          Decline
        </button>
      );
    } else if (order.status === 'confirmed') {
      actions.push(
        <button 
          key="preparing" 
          className="btn btn-sm btn-primary"
          onClick={() => updateOrderStatus(order.id, 'preparing')}
        >
          Start Preparing
        </button>
      );
    } else if (order.status === 'preparing') {
      actions.push(
        <button 
          key="ready" 
          className="btn btn-sm btn-success"
          onClick={() => updateOrderStatus(order.id, 'ready')}
        >
          Mark Ready
        </button>
      );
    } else if (order.status === 'ready') {
      actions.push(
        <button 
          key="completed" 
          className="btn btn-sm btn-secondary"
          onClick={() => updateOrderStatus(order.id, 'completed')}
        >
          Mark Completed
        </button>
      );
    }
    
    return actions;
  };

  const filterOrders = (status) => {
    if (status === 'active') {
      return orders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
      );
    }
    if (status === 'completed') {
      return orders.filter(order => 
        ['completed', 'cancelled'].includes(order.status)
      );
    }
    return orders.filter(order => order.status === status);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getOrderTotal = (orderItems) => {
    return orderItems.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  const activeOrders = filterOrders('active');
  const completedOrders = filterOrders('completed');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>📋 Order Management</h4>
        <span className="badge bg-primary badge-lg">
          {activeOrders.length} Active Orders
        </span>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Orders ({activeOrders.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedOrders.length})
          </button>
        </li>
      </ul>

      {/* Orders List */}
      <div className="tab-content">
        {filterOrders(activeTab).length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">
              {activeTab === 'active' 
                ? "No active orders at the moment" 
                : "No completed orders today"}
            </p>
          </div>
        ) : (
          filterOrders(activeTab).map((order) => (
            <div key={order.id} className="card mb-3 border-start border-4" 
                 style={{ borderLeftColor: `var(--bs-${getStatusColor(order.status)})` }}>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">
                        Order #{order.order_number}
                        <span className={`badge bg-${getStatusColor(order.status)} ms-2`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </h6>
                      <small className="text-muted">
                        {formatTime(order.created_at)}
                      </small>
                    </div>
                    
                    <p className="mb-2">
                      <strong>Customer:</strong> {order.customers?.phone || 'Unknown'}
                      <br />
                      <strong>Total:</strong> ${order.total_amount?.toFixed(2)}
                      <br />
                      <strong>Payment:</strong> 
                      <span className={`ms-1 ${order.payment_status === 'paid' ? 'text-success' : 'text-warning'}`}>
                        {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </p>

                    {order.special_instructions && (
                      <div className="alert alert-info py-2">
                        <small><strong>Special Instructions:</strong> {order.special_instructions}</small>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Items:</small>
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between">
                          <span>{item.quantity}x {item.menu_items?.name}</span>
                          <span>${(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-md-4 text-end">
                    <div className="d-flex flex-column gap-2">
                      {getStatusActions(order)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {orders.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">{activeOrders.length}</h5>
                <p className="card-text small">Active Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{completedOrders.length}</h5>
                <p className="card-text small">Completed Today</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">
                  ${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(2)}
                </h5>
                <p className="card-text small">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  {orders.filter(o => o.payment_status === 'paid').length}
                </h5>
                <p className="card-text small">Paid Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}