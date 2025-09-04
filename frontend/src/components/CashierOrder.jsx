import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import cashDrawer from "../utils/cashDrawer";

export default function CashierOrder({ user, onOrderCreated }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [drawerSettings, setDrawerSettings] = useState({ autoOpen: true });
  const [drawerStatus, setDrawerStatus] = useState({ isConnected: false });

  useEffect(() => {
    if (user) {
      fetchMenuItems();
      loadDrawerSettings();
      updateDrawerStatus();
      
      // Update drawer status periodically
      const interval = setInterval(updateDrawerStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateDrawerStatus = () => {
    const status = cashDrawer.getStatus();
    setDrawerStatus(status);
  };

  const loadDrawerSettings = () => {
    const savedSettings = localStorage.getItem('cashDrawerSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setDrawerSettings(settings);
      } catch (error) {
        console.error('Error loading drawer settings:', error);
      }
    }
  };

  const openCashDrawer = async () => {
    try {
      if (drawerSettings.autoOpen && cashDrawer.getStatus().isConnected) {
        await cashDrawer.openDrawer();
        console.log('Cash drawer opened automatically');
      }
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      // Don't block order creation if drawer fails
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("vendor_id", user.id)
        .order("name");

      if (error) {
        console.error("Error fetching menu items:", error);
      } else {
        setMenuItems(data || []);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((cartItem) => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter((cartItem) => cartItem.id !== itemId));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const categorizeMenuItems = () => {
    const categories = {
      appetizers: [],
      mains: [],
      sides: [],
      drinks: [],
      desserts: [],
      other: []
    };
    
    menuItems.forEach(item => {
      const category = item.category?.toLowerCase() || 'other';
      if (category === 'appetizer' || category.includes('appetizer') || category.includes('starter')) {
        categories.appetizers.push(item);
      } else if (category === 'drink' || category.includes('drink') || category.includes('beverage')) {
        categories.drinks.push(item);
      } else if (category === 'dessert' || category.includes('dessert') || category.includes('sweet')) {
        categories.desserts.push(item);
      } else if (category === 'side' || category.includes('side')) {
        categories.sides.push(item);
      } else if (category === 'main' || category.includes('main') || category.includes('entree') || category.includes('burger') || category.includes('pizza') || category.includes('taco')) {
        categories.mains.push(item);
      } else {
        categories.other.push(item);
      }
    });
    
    return categories;
  };

  const filteredMenuItems = () => {
    let items = menuItems;
    
    if (selectedCategory !== 'all') {
      const categories = categorizeMenuItems();
      items = categories[selectedCategory] || [];
    }
    
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };

  const handleCreateOrder = async () => {
    if (!customerPhone.trim()) {
      alert("Please enter customer phone number");
      return;
    }
    
    if (cart.length === 0) {
      alert("Please add items to cart");
      return;
    }

    setLoading(true);
    
    try {
      // Create or get customer
      let customerId;
      const phone = customerPhone.replace(/\D/g, '');
      
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert([{ 
            phone,
            name: customerName || null
          }])
          .select()
          .single();

        if (customerError) {
          alert("Error creating customer record");
          return;
        }
        customerId = newCustomer.id;
      }

      // Generate order number
      const orderNumber = Math.floor(Math.random() * 9000) + 1000;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          vendor_id: user.id,
          customer_id: customerId,
          order_number: orderNumber,
          status: 'pending',
          total_amount: getCartTotal(),
          payment_status: 'paid', // Cashier orders are paid in cash
          special_instructions: specialInstructions || null,
          estimated_ready_time: new Date(Date.now() + 20 * 60 * 1000), // 20 min from now
          order_type: 'cashier' // Mark as cashier order
        }])
        .select()
        .single();

      if (orderError) {
        alert("Error creating order: " + orderError.message);
        return;
      }

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        alert("Error saving order items: " + itemsError.message);
        return;
      }

      // Success! Open cash drawer if enabled
      await openCashDrawer();
      
      // Clear the form
      setCart([]);
      setCustomerPhone("");
      setCustomerName("");
      setSpecialInstructions("");
      
      alert(`✅ Order #${orderNumber} created successfully!`);
      
      if (onOrderCreated) {
        onOrderCreated(order);
      }

    } catch (error) {
      console.error("Order creation error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      {/* Left Panel - Menu Items */}
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold text-dark mb-4">🛒 Select Menu Items</h5>
            
            {/* Search and Filter */}
            <div className="row mb-4">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="🔍 Search menu items..."
                  style={{ borderRadius: '12px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select form-select-lg"
                  style={{ borderRadius: '12px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="mains">🍔 Mains</option>
                  <option value="appetizers">🥗 Appetizers</option>
                  <option value="sides">🍟 Sides</option>
                  <option value="drinks">🥤 Drinks</option>
                  <option value="desserts">🍰 Desserts</option>
                  <option value="other">🍽️ Other</option>
                </select>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="row g-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredMenuItems().map((item) => (
                <div key={item.id} className="col-lg-6 col-md-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="rounded-3"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                            style={{ width: "60px", height: "60px", flexShrink: 0 }}
                          >
                            <span className="text-muted fs-5">🍽️</span>
                          </div>
                        )}
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="fw-bold mb-1">{item.name}</h6>
                          <p className="text-muted small mb-2 lh-sm">{item.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-6 fw-bold text-success">${item.price.toFixed(2)}</span>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => addToCart(item)}
                              style={{ borderRadius: '8px' }}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenuItems().length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">No menu items found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart and Customer Info */}
      <div className="col-lg-5">
        {/* Cash Drawer Status */}
        {drawerSettings.autoOpen && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <span className={`fs-4 me-2 ${drawerStatus.isConnected ? 'text-success' : 'text-muted'}`}>
                  {drawerStatus.isConnected ? '💰' : '🔌'}
                </span>
                <div className="flex-grow-1">
                  <div className="fw-semibold">
                    Cash Drawer: {drawerStatus.isConnected ? 'Connected' : 'Not Connected'}
                  </div>
                  <small className="text-muted">
                    {drawerStatus.isConnected 
                      ? 'Will open automatically when order is completed'
                      : 'Connect in Hardware settings to enable auto-open'
                    }
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold text-dark mb-4">👤 Customer Information</h5>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Phone Number *</label>
              <input
                type="tel"
                className="form-control form-control-lg"
                placeholder="(555) 123-4567"
                style={{ borderRadius: '12px' }}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Customer Name (Optional)</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="John Doe"
                style={{ borderRadius: '12px' }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Special Instructions</label>
              <textarea
                className="form-control"
                rows="3"
                style={{ borderRadius: '12px' }}
                placeholder="Any special requests or notes..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-dark mb-0">🛒 Order Summary</h5>
              {cart.length > 0 && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={clearCart}
                  style={{ borderRadius: '8px' }}
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">Cart is empty</p>
                <small className="text-muted">Add items from the menu</small>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold">{item.name}</h6>
                        <small className="text-muted">${item.price.toFixed(2)} each</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => removeFromCart(item.id)}
                          style={{ borderRadius: '8px', width: '30px', height: '30px' }}
                        >
                          -
                        </button>
                        <span className="fw-bold px-2">{item.quantity}</span>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => addToCart(item)}
                          style={{ borderRadius: '8px', width: '30px', height: '30px' }}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-end ms-3">
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-top pt-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Items ({getCartItemCount()}):</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="fs-5">Total:</strong>
                    <strong className="fs-4 text-success">${getCartTotal().toFixed(2)}</strong>
                  </div>
                </div>

                {/* Create Order Button */}
                <button
                  className="btn btn-success btn-lg w-100 fw-bold"
                  style={{ borderRadius: '12px' }}
                  onClick={handleCreateOrder}
                  disabled={loading || !customerPhone.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      💳 Create Cash Order - ${getCartTotal().toFixed(2)}
                    </>
                  )}
                </button>

                <div className="text-center mt-2">
                  <small className="text-muted">
                    💡 Cash payment collected at counter
                  </small>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}