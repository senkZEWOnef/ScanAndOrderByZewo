import { useState } from "react";

export default function CartModal({ 
  cart, 
  setCart, 
  vendor, 
  isOpen, 
  onClose, 
  onCheckout 
}) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const updateQuantity = (uniqueId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.uniqueId !== uniqueId));
    } else {
      setCart(cart.map(item => 
        item.uniqueId === uniqueId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTax = () => {
    return getCartTotal() * 0.08; // 8% tax
  };

  const getFinalTotal = () => {
    return getCartTotal() + getTax();
  };

  const handleCheckout = () => {
    if (!customerPhone.trim()) {
      alert("Please enter your phone number");
      return;
    }
    if (customerPhone.replace(/\D/g, '').length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    
    onCheckout({
      phone: customerPhone,
      instructions: specialInstructions,
      items: cart,
      subtotal: getCartTotal(),
      tax: getTax(),
      total: getFinalTotal()
    });
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0,3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0,3)}) ${numbers.slice(3,6)}-${numbers.slice(6,10)}`;
  };

  const handlePhoneChange = (e) => {
    setCustomerPhone(formatPhone(e.target.value));
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 p-4" style={{
            background: vendor?.primary_color && vendor?.secondary_color 
              ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
              : 'linear-gradient(45deg, #007bff, #6f42c1)'
          }}>
            <div className="text-white">
              <h4 className="modal-title fw-bold mb-0">🛒 Your Order</h4>
              <p className="mb-0 opacity-90">{vendor?.business_name}</p>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {cart.length === 0 ? (
              <p className="text-center text-muted">Your cart is empty</p>
            ) : (
              <>
                {/* Cart Items */}
                <div className="mb-4">
                  <h6 className="mb-3">Order Items</h6>
                  {cart.map((item) => (
                    <div key={item.uniqueId || item.id} className="card mb-2 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                      <div className="card-body p-3">
                        <div className="row align-items-center">
                          <div className="col-2">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="img-fluid rounded"
                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px" }}
                              >
                                <span className="small">🍽️</span>
                              </div>
                            )}
                          </div>
                          <div className="col-5">
                            <h6 className="mb-1">{item.name}</h6>
                            <small className="text-muted">${item.price.toFixed(2)} each</small>
                            {item.customizations && (
                              <div className="mt-1">
                                <small className="text-info fw-semibold d-block">
                                  ✨ {item.customizations}
                                </small>
                              </div>
                            )}
                          </div>
                          <div className="col-3">
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity - 1)}
                                style={{ width: "30px", height: "30px", padding: "0" }}
                              >
                                -
                              </button>
                              <span className="mx-2 fw-bold">{item.quantity}</span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.uniqueId || item.id, item.quantity + 1)}
                                style={{ width: "30px", height: "30px", padding: "0" }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="col-2 text-end">
                            <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
                  <div className="card-body">
                    <h6 className="card-title fw-bold">📋 Order Summary</h6>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Tax (8%)</span>
                      <span>${getTax().toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span>${getFinalTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <h6 className="mb-3">Contact Information</h6>
                  <div className="mb-3">
                    <label className="form-label">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="(555) 123-4567"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      maxLength="14"
                      required
                    />
                    <div className="form-text">
                      We'll text you when your order is ready for pickup
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Special Instructions (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Any allergies, preferences, or special requests..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      maxLength="200"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Continue Shopping
            </button>
            {cart.length > 0 && (
              <button 
                type="button" 
                className="btn btn-lg fw-bold px-4 text-white"
                style={{
                  background: vendor?.primary_color && vendor?.secondary_color 
                    ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
                    : 'linear-gradient(45deg, #007bff, #6f42c1)',
                  borderRadius: '15px',
                  border: 'none'
                }}
                onClick={handleCheckout}
              >
                💳 Proceed to Payment - ${getFinalTotal().toFixed(2)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}