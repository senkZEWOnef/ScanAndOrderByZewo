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
    <div className="ipad-grid">
      {/* Left Panel - Menu Items */}
      <div className="flex-grow-1">
        <div className="card-modern mb-4">
          <div className="card-modern-header">
            <h3 className="heading-3-modern mb-0">🛒 Select Menu Items</h3>
          </div>
          <div className="card-modern-body">
            
            {/* Search and Filter */}
            <div className="form-modern mb-6">
              <div className="grid-modern grid-cols-2-modern gap-4">
                <div className="form-group-modern">
                  <input
                    type="text"
                    className="form-input-modern"
                    placeholder="🔍 Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="form-group-modern">
                  <select
                    className="form-input-modern"
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
            </div>

            {/* Menu Items Grid */}
            <div className="ipad-card-grid ipad-scroll">
              {filteredMenuItems().map((item) => (
                <div key={item.id}>
                  <div className="card-modern hover-lift-modern h-100">
                    <div className="p-4">
                      <div className="d-flex align-items-start gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                              borderRadius: 'var(--radius-lg)',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div
                            style={{ 
                              width: "64px", 
                              height: "64px", 
                              backgroundColor: 'var(--color-gray-100)',
                              borderRadius: 'var(--radius-lg)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <span style={{ fontSize: '1.5rem' }}>🍽️</span>
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <h4 className="fw-semibold mb-1" style={{ color: 'var(--color-gray-800)' }}>{item.name}</h4>
                          <p className="text-muted-modern text-small-modern mb-3">{item.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold" style={{ color: 'var(--color-success)', fontSize: 'var(--text-lg)' }}>${item.price.toFixed(2)}</span>
                            <button
                              className="btn-modern btn-primary-modern clickable-modern"
                              onClick={() => addToCart(item)}
                            >
                              Add
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
              <div className="text-center py-8">
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🍽️</div>
                <p className="text-muted-modern">No menu items found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart and Customer Info */}
      <div style={{ width: '400px', flexShrink: 0 }}>
        {/* Cash Drawer Status */}
        {drawerSettings.autoOpen && (
          <div className="card-modern mb-4">
            <div className="p-3">
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '1.5rem' }}>
                  {drawerStatus.isConnected ? '💰' : '🔌'}
                </span>
                <div className="flex-grow-1">
                  <div className="fw-semibold" style={{ color: 'var(--color-gray-800)' }}>
                    Cash Drawer: {drawerStatus.isConnected ? 'Connected' : 'Not Connected'}
                  </div>
                  <div className="text-muted-modern text-small-modern">
                    {drawerStatus.isConnected 
                      ? 'Will open automatically when order is completed'
                      : 'Connect in Hardware settings to enable auto-open'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="card-modern mb-4">
          <div className="card-modern-header">
            <h3 className="heading-3-modern mb-0">👤 Customer Information</h3>
          </div>
          <div className="card-modern-body">
            <div className="form-modern">
              <div className="form-group-modern">
                <label className="form-label-modern">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input-modern"
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">Customer Name (Optional)</label>
                <input
                  type="text"
                  className="form-input-modern"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">Special Instructions</label>
                <textarea
                  className="form-input-modern"
                  rows="3"
                  placeholder="Any special requests or notes..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="card-modern">
          <div className="card-modern-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="heading-3-modern mb-0">🛒 Order Summary</h3>
              {cart.length > 0 && (
                <button
                  className="btn-modern btn-secondary-modern text-small-modern"
                  onClick={clearCart}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="card-modern-body">

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🛒</div>
                <p className="text-muted-modern">Cart is empty</p>
                <p className="text-muted-modern text-small-modern">Add items from the menu</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="ipad-scroll mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-4 p-4" style={{ backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
                      <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-1" style={{ color: 'var(--color-gray-800)' }}>{item.name}</h4>
                        <div className="text-muted-modern text-small-modern">${item.price.toFixed(2)} each</div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <button
                          className="btn-modern btn-secondary-modern clickable-modern"
                          onClick={() => removeFromCart(item.id)}
                          style={{ minWidth: '40px', height: '40px', padding: '0' }}
                        >
                          −
                        </button>
                        <span className="fw-bold" style={{ minWidth: '24px', textAlign: 'center', color: 'var(--color-gray-800)' }}>{item.quantity}</span>
                        <button
                          className="btn-modern btn-primary-modern clickable-modern"
                          onClick={() => addToCart(item)}
                          style={{ minWidth: '40px', height: '40px', padding: '0' }}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-end ms-4" style={{ minWidth: '80px' }}>
                        <div className="fw-bold" style={{ color: 'var(--color-gray-800)', fontSize: 'var(--text-lg)' }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{ color: 'var(--color-gray-600)' }}>Items ({getCartItemCount()}):</span>
                    <span style={{ color: 'var(--color-gray-800)' }}>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-800)' }}>Total:</span>
                    <span className="fw-bold" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-success)' }}>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Create Order Button */}
                <button
                  className="btn-modern btn-success-modern btn-lg-modern w-100 fw-bold"
                  onClick={handleCreateOrder}
                  disabled={loading || !customerPhone.trim()}
                  style={{ padding: 'var(--space-4) var(--space-6)' }}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner-modern me-2" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      💳 Create Cash Order • ${getCartTotal().toFixed(2)}
                    </>
                  )}
                </button>

                <div className="text-center mt-3">
                  <div className="text-muted-modern text-small-modern">
                    💡 Cash payment collected at counter
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}