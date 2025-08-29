import { useState } from 'react';
import stripePromise from '../lib/stripe';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  orderData, 
  onPaymentSuccess,
  vendor 
}) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const handlePayment = async () => {
    if (paymentMethod === 'cash') {
      // Cash payment - just complete the order
      onPaymentSuccess({ 
        method: 'cash', 
        status: 'pending_cash_payment' 
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, you'd call your backend to create a PaymentIntent
      // For now, we'll simulate the Stripe payment flow
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      onPaymentSuccess({
        method: 'card',
        status: 'paid',
        paymentIntentId: 'pi_' + Math.random().toString(36).substr(2, 9)
      });
      
    } catch (error) {
      alert('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    
    try {
      const stripe = await stripePromise;
      
      // In production, you would:
      // 1. Call your backend API to create a PaymentIntent
      // 2. Get the client_secret from your backend
      // 3. Use stripe.confirmCardPayment() with the client_secret
      
      // For now, let's simulate this
      console.log('Would call backend to create PaymentIntent for:', orderData);
      
      // Simulate successful payment after delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentSuccess({
        method: 'card',
        status: 'paid',
        paymentIntentId: 'pi_simulated_' + Date.now()
      });
      
    } catch (error) {
      alert('Payment processing failed. Please try again.');
      console.error('Stripe error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 p-4" style={{
            background: vendor?.primary_color && vendor?.secondary_color 
              ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
              : 'linear-gradient(45deg, #28a745, #20c997)'
          }}>
            <div className="text-white">
              <h4 className="modal-title fw-bold mb-0">💳 Payment</h4>
              <p className="mb-0 opacity-90">Order #{orderData?.orderNumber}</p>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {/* Order Summary Card */}
            <div className="card mb-4 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div className="card-body p-3 text-center">
                <div className="fs-2 fw-bold text-success mb-2">${orderData?.total?.toFixed(2)}</div>
                <div className="text-muted">
                  🛒 {orderData?.items?.length} {orderData?.items?.length === 1 ? 'item' : 'items'} from {orderData?.vendorName}
                </div>
                <div className="mt-2">
                  <span className="badge" style={{ backgroundColor: vendor?.accent_color || '#ffc107' }}>
                    ⛱️ Ready in 15-20 minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">💳 Choose Payment Method</h6>
              
              {/* Card Payment Option */}
              <div className="card mb-3 border-0 shadow-sm" 
                   style={{ 
                     borderRadius: '12px',
                     border: paymentMethod === 'card' ? `2px solid ${vendor?.primary_color || '#007bff'}` : '1px solid #dee2e6'
                   }}>
                <div className="card-body p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cardPayment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="cardPayment">
                      💳 Credit/Debit Card
                      <div className="small text-muted mt-1">Pay now with your card (Secure)</div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Cash Payment Option */}
              <div className="card border-0 shadow-sm" 
                   style={{ 
                     borderRadius: '12px',
                     border: paymentMethod === 'cash' ? `2px solid ${vendor?.accent_color || '#ffc107'}` : '1px solid #dee2e6'
                   }}>
                <div className="card-body p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cashPayment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="cashPayment">
                      💵 Pay Cash at Pickup
                      <div className="small text-muted mt-1">Pay when you collect your order</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="alert alert-info">
                <small>
                  <strong>Demo Mode:</strong> In production, this would show Stripe's secure payment form. 
                  For now, clicking "Pay Now" will simulate a successful payment.
                </small>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="alert alert-warning">
                <small>
                  <strong>Cash Payment:</strong> Please have exact change ready when you arrive. 
                  Your order will be confirmed and prepared once you place it.
                </small>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-lg fw-bold px-4 text-white w-100"
              style={{
                background: vendor?.primary_color && vendor?.secondary_color 
                  ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
                  : 'linear-gradient(45deg, #28a745, #20c997)',
                borderRadius: '15px',
                border: 'none'
              }}
              onClick={paymentMethod === 'card' ? handleStripePayment : handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing Payment...
                </>
              ) : (
                paymentMethod === 'card' ? 
                  `💳 Pay $${orderData?.total?.toFixed(2)} Now` : 
                  `✅ Confirm Order - Pay $${orderData?.total?.toFixed(2)} Cash`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}