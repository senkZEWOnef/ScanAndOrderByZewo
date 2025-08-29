import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone');
  
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderNumber && phone) {
      fetchOrderDetails();
    }
  }, [orderNumber, phone]);

  const fetchOrderDetails = async () => {
    try {
      // Get customer by phone
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone.replace(/\D/g, ''))
        .single();

      if (!customer) {
        setError('Order not found. Please check your phone number.');
        setLoading(false);
        return;
      }

      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          vendor_profiles (
            business_name,
            logo_url,
            primary_color,
            secondary_color,
            accent_color
          )
        `)
        .eq('order_number', orderNumber)
        .eq('customer_id', customer.id)
        .single();

      if (orderError || !orderData) {
        setError('Order not found.');
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setVendor(orderData.vendor_profiles);

      // Get order items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_items (name, price)
        `)
        .eq('order_id', orderData.id);

      setOrderItems(itemsData || []);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Order tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', text: 'Order Received', color: '#ffc107', description: 'Your order has been received and is being prepared.' };
      case 'preparing':
        return { icon: '👨‍🍳', text: 'Preparing', color: '#fd7e14', description: 'Your delicious food is being prepared with care.' };
      case 'ready':
        return { icon: '✅', text: 'Ready for Pickup', color: '#28a745', description: 'Your order is ready! Please come to the food truck.' };
      case 'completed':
        return { icon: '🎉', text: 'Completed', color: '#6f42c1', description: 'Order completed. Thank you for choosing us!' };
      case 'cancelled':
        return { icon: '❌', text: 'Cancelled', color: '#dc3545', description: 'This order has been cancelled.' };
      default:
        return { icon: '📋', text: 'Unknown Status', color: '#6c757d', description: 'Status unknown.' };
    }
  };

  const getEstimatedTime = () => {
    if (!order?.estimated_ready_time) return null;
    
    const readyTime = new Date(order.estimated_ready_time);
    const now = new Date();
    const diffMinutes = Math.max(0, Math.ceil((readyTime - now) / (1000 * 60)));
    
    if (diffMinutes <= 0) return 'Ready now!';
    return `${diffMinutes} minutes`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center"
           style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-body p-5 text-center">
              <div className="fs-1 mb-3">😕</div>
              <h4 className="mb-3">Order Not Found</h4>
              <p className="text-muted mb-4">{error}</p>
              <a href="/" className="btn btn-primary" style={{ borderRadius: '12px' }}>
                Go Back Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(order.status);
  const estimatedTime = getEstimatedTime();

  return (
    <div className="min-vh-100" style={{ 
      background: vendor?.primary_color && vendor?.secondary_color 
        ? `linear-gradient(180deg, ${vendor.primary_color}10 0%, ${vendor.secondary_color}05 100%)` 
        : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' 
    }}>
      <div className="container py-5" style={{ maxWidth: '600px' }}>
        
        {/* Header */}
        <div className="text-center mb-5">
          {vendor?.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={`${vendor.business_name} Logo`}
              className="rounded-3 shadow-sm mb-3"
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
          ) : (
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                 style={{ 
                   width: '80px', 
                   height: '80px',
                   background: vendor?.primary_color && vendor?.secondary_color 
                     ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
                     : 'linear-gradient(45deg, #007bff, #6f42c1)'
                 }}>
              <span className="text-white fs-2">🍽️</span>
            </div>
          )}
          <h1 className="h3 fw-bold mb-2">{vendor?.business_name}</h1>
          <p className="text-muted">Order Tracking</p>
        </div>

        {/* Order Status Card */}
        <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '20px' }}>
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <div className="fs-1 mb-3">{statusDetails.icon}</div>
              <h4 className="fw-bold" style={{ color: statusDetails.color }}>
                {statusDetails.text}
              </h4>
              <p className="text-muted mb-0">{statusDetails.description}</p>
              
              {estimatedTime && order.status !== 'completed' && order.status !== 'cancelled' && (
                <div className="mt-3">
                  <span className="badge fs-6 py-2 px-3" 
                        style={{ backgroundColor: vendor?.accent_color || '#ffc107' }}>
                    ⏱️ {estimatedTime}
                  </span>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="row text-center">
              <div className="col-6">
                <div className="border-end">
                  <div className="fw-bold">Order #</div>
                  <div className="text-muted">{order.order_number}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="fw-bold">Total</div>
                <div className="text-success fw-bold">${order.total_amount?.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">🛒 Your Order</h6>
            {orderItems.map((item, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span className="fw-semibold">{item.menu_items?.name}</span>
                  <span className="text-muted ms-2">× {item.quantity}</span>
                </div>
                <span className="text-success fw-bold">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            
            {order.special_instructions && (
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  <strong>Special Instructions:</strong> {order.special_instructions}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-4">📋 Order Progress</h6>
            <div className="d-flex flex-column gap-3">
              {[
                { status: 'pending', label: 'Order Received', icon: '📨' },
                { status: 'preparing', label: 'Being Prepared', icon: '👨‍🍳' },
                { status: 'ready', label: 'Ready for Pickup', icon: '✅' },
                { status: 'completed', label: 'Order Complete', icon: '🎉' }
              ].map((step, index) => {
                const isCompleted = ['pending', 'preparing', 'ready', 'completed'].indexOf(order.status) >= index;
                const isCurrent = order.status === step.status;
                
                return (
                  <div key={step.status} className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: isCompleted 
                          ? (vendor?.primary_color || '#007bff') 
                          : '#e9ecef',
                        color: isCompleted ? 'white' : '#6c757d'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{step.icon}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className={`fw-semibold ${isCurrent ? 'text-primary' : ''}`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <small className="text-muted">Currently in progress</small>
                      )}
                    </div>
                    {isCompleted && (
                      <span className="text-success fs-5">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4 text-center">
            <h6 className="fw-bold mb-3">Need Help?</h6>
            <p className="text-muted small mb-3">
              If you have any questions about your order, please contact the food truck directly.
            </p>
            <button 
              className="btn btn-outline-primary"
              style={{ borderRadius: '12px' }}
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}