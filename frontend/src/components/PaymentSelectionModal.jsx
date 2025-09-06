import { useState } from "react";

export default function PaymentSelectionModal({ 
  isOpen, 
  onClose, 
  onPaymentMethodSelect, 
  orderData, 
  vendor 
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay securely with your card',
      color: 'var(--color-primary)',
      instantPayment: true
    },
    {
      id: 'ath_movil',
      name: 'ATH Móvil',
      icon: '📱',
      description: 'Pay with ATH Móvil app',
      color: '#FF6B35',
      instantPayment: true
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: '💵',
      description: 'Pay at the counter when called',
      color: 'var(--color-success)',
      instantPayment: false
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onPaymentMethodSelect(selectedMethod);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="card-modern">
          {/* Header */}
          <div className="card-modern-header text-center" 
               style={{
                 background: 'linear-gradient(135deg, var(--color-primary), #667eea)',
                 color: 'white'
               }}>
            <h2 className="heading-3-modern mb-2">💳 Choose Payment Method</h2>
            <p className="mb-0 opacity-90">How would you like to pay for your order?</p>
            <button 
              type="button" 
              className="btn-close btn-close-white position-absolute"
              style={{ top: '1rem', right: '1rem' }}
              onClick={onClose}
            ></button>
          </div>
          
          <div className="card-modern-body p-6">
            {/* Order Summary */}
            <div className="mb-6 p-4" style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="heading-3-modern mb-0">Order Summary</h3>
                <span className="fw-bold" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-success)' }}>
                  ${orderData?.total?.toFixed(2)}
                </span>
              </div>
              <div className="text-muted-modern">
                <div className="d-flex justify-content-between mb-1">
                  <span>{orderData?.items?.length} items</span>
                  <span>Order #{orderData?.orderNumber}</span>
                </div>
                <div className="text-small-modern">{vendor?.business_name}</div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h4 className="fw-semibold mb-4" style={{ color: 'var(--color-gray-800)' }}>Select Payment Method</h4>
              
              <div className="grid-modern gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <div 
                      className={`card-modern hover-lift-modern clickable-modern p-4 ${
                        selectedMethod?.id === method.id ? 'border-2' : ''
                      }`}
                      style={{
                        cursor: 'pointer',
                        borderColor: selectedMethod?.id === method.id ? method.color : 'rgba(255, 255, 255, 0.2)',
                        backgroundColor: selectedMethod?.id === method.id ? `${method.color}20` : 'rgba(255, 255, 255, 0.4)'
                      }}
                      onClick={() => handleMethodSelect(method)}
                    >
                      <div className="d-flex align-items-center gap-4">
                        {/* Icon */}
                        <div 
                          style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: selectedMethod?.id === method.id ? method.color : 'var(--color-gray-100)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                          }}
                        >
                          {method.icon}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-grow-1">
                          <h4 className="fw-bold mb-1" style={{ color: 'var(--color-gray-800)' }}>
                            {method.name}
                          </h4>
                          <p className="text-muted-modern text-small-modern mb-2">
                            {method.description}
                          </p>
                          
                          {/* Processing Info */}
                          <div className="d-flex align-items-center gap-2">
                            {method.instantPayment ? (
                              <span className="badge-modern badge-success-modern">
                                ⚡ Instant Payment
                              </span>
                            ) : (
                              <span className="badge-modern badge-warning-modern">
                                ⏳ Pay at Counter
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        <div>
                          {selectedMethod?.id === method.id ? (
                            <div 
                              style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: method.color,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                            </div>
                          ) : (
                            <div 
                              style={{
                                width: '24px',
                                height: '24px',
                                border: '2px solid var(--color-gray-300)',
                                borderRadius: '50%'
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Cash Payment Details */}
                      {method.id === 'cash' && selectedMethod?.id === 'cash' && (
                        <div className="mt-4 p-3" style={{ 
                          background: 'rgba(245, 158, 11, 0.15)', 
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                          <div className="d-flex align-items-start gap-2">
                            <span style={{ fontSize: '1.2rem' }}>💡</span>
                            <div>
                              <div className="fw-semibold text-small-modern mb-1">How Cash Payment Works:</div>
                              <ul className="text-small-modern text-muted-modern mb-0" style={{ paddingLeft: '1rem' }}>
                                <li>Your order will be placed and assigned a number</li>
                                <li>Wait for your number to be called</li>
                                <li>Pay with cash at the counter</li>
                                <li>Receive your order immediately after payment</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                className="btn-modern btn-primary-modern btn-lg-modern fw-bold px-6"
                onClick={handleContinue}
                disabled={!selectedMethod}
                style={{ minWidth: '200px' }}
              >
                {selectedMethod?.instantPayment 
                  ? `Continue to ${selectedMethod.name}` 
                  : 'Place Order (Pay at Counter)'
                }
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <div className="text-muted-modern text-small-modern">
                🔒 Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}