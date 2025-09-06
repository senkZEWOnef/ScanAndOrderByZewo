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
  const [paymentMethod, setPaymentMethod] = useState(orderData?.paymentMethod?.id || 'card');
  
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
      if (paymentMethod === 'ath_movil') {
        // Simulate ATH Móvil payment flow
        console.log('Processing ATH Móvil payment for:', orderData);
        
        // Simulate API delay for ATH Móvil processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate successful ATH Móvil payment
        onPaymentSuccess({
          method: 'ath_movil',
          status: 'paid',
          transactionId: 'atm_' + Math.random().toString(36).substr(2, 9)
        });
      } else {
        // Card payment flow
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
      }
      
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
            <div className="card mb-4 border-0" style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div className="card-body p-3 text-center">
                <div className="fs-2 fw-bold text-success mb-2">${orderData?.total?.toFixed(2)}</div>
                <div className="text-muted">
                  🛒 {orderData?.items?.length} {orderData?.items?.length === 1 ? 'item' : 'items'} from {vendor?.business_name}
                </div>
                <div className="mt-2">
                  <span className="badge" style={{ backgroundColor: vendor?.accent_color || '#ffc107' }}>
                    ⛱️ Ready in 15-20 minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Display */}
            <div className="card mb-4 border-0" style={{ 
              background: 'rgba(255, 255, 255, 0.4)', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div className="card-body p-3">
                <h6 className="fw-bold mb-3">💳 Payment Method</h6>
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: orderData?.paymentMethod?.color || 'var(--color-primary)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {orderData?.paymentMethod?.icon || '💳'}
                  </div>
                  <div>
                    <div className="fw-semibold">{orderData?.paymentMethod?.name || 'Credit/Debit Card'}</div>
                    <div className="text-muted small">{orderData?.paymentMethod?.description || 'Pay securely with your card'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Processing Info */}
            {paymentMethod === 'card' && (
              <div className="alert alert-info border-0" style={{ borderRadius: '12px' }}>
                <div className="d-flex align-items-start gap-2">
                  <span style={{ fontSize: '1.1rem' }}>🔐</span>
                  <div>
                    <div className="fw-semibold small mb-1">Secure Card Payment</div>
                    <small className="text-muted">
                      Your payment is processed securely using industry-standard encryption. 
                      In production, this would integrate with Stripe's secure payment system.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'ath_movil' && (
              <div className="alert alert-info border-0" style={{ borderRadius: '12px' }}>
                <div className="d-flex align-items-start gap-2">
                  <span style={{ fontSize: '1.1rem' }}>📱</span>
                  <div>
                    <div className="fw-semibold small mb-1">ATH Móvil Payment</div>
                    <small className="text-muted">
                      You'll be redirected to the ATH Móvil app to complete your payment. 
                      Make sure you have the ATH Móvil app installed on your device.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="alert alert-warning border-0" style={{ borderRadius: '12px' }}>
                <div className="d-flex align-items-start gap-2">
                  <span style={{ fontSize: '1.1rem' }}>💵</span>
                  <div>
                    <div className="fw-semibold small mb-1">Cash Payment</div>
                    <small className="text-muted">
                      Please have exact change ready when you arrive. 
                      Your order will be confirmed and prepared once you place it.
                    </small>
                  </div>
                </div>
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
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {paymentMethod === 'ath_movil' ? 'Processing ATH Móvil Payment...' : 'Processing Payment...'}
                </>
              ) : (
                paymentMethod === 'card' ? 
                  `💳 Pay $${orderData?.total?.toFixed(2)} Now` : 
                  paymentMethod === 'ath_movil' ?
                    `📱 Pay $${orderData?.total?.toFixed(2)} with ATH Móvil` :
                    `✅ Confirm Order - Pay $${orderData?.total?.toFixed(2)} Cash`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}