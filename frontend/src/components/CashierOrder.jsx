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
  const [drawerStatus, setDrawerStatus] = useState({ isConnected: false });

  const menuCategories = [
    { value: 'all', label: 'All Items', icon: '🍽️' },
    { value: 'appetizer', label: 'Appetizers', icon: '🥗' },
    { value: 'main', label: 'Main Dishes', icon: '🍔' },
    { value: 'side', label: 'Sides', icon: '🍟' },
    { value: 'drink', label: 'Drinks', icon: '🥤' },
    { value: 'dessert', label: 'Desserts', icon: '🍰' },
    { value: 'combo', label: 'Combos', icon: '🍽️' },
    { value: 'special', label: 'Specials', icon: '⭐' },
  ];

  useEffect(() => {
    if (user) {
      fetchMenuItems();
      updateDrawerStatus();
      
      const interval = setInterval(updateDrawerStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateDrawerStatus = () => {
    const status = cashDrawer.getStatus();
    setDrawerStatus(status);
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
    setCustomerPhone("");
    setCustomerName("");
    setSpecialInstructions("");
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const createOrder = async () => {
    if (cart.length === 0) {
      alert("Please add items to the cart");
      return;
    }

    setLoading(true);

    try {
      // Create customer if needed
      let customerId = null;
      if (customerPhone || customerName) {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .upsert([{ phone: customerPhone, name: customerName }], { onConflict: 'phone' })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = customerData.id;
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            vendor_id: user.id,
            customer_id: customerId,
            total_amount: getTotalAmount(),
            status: "pending",
            special_instructions: specialInstructions,
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Try to open cash drawer
      try {
        if (drawerStatus.isConnected) {
          await cashDrawer.openDrawer();
        }
      } catch (drawerError) {
        console.error('Failed to open cash drawer:', drawerError);
      }

      alert(`Order #${orderData.id} created successfully!`);
      clearCart();
      if (onOrderCreated) onOrderCreated();

    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="row g-4">
      {/* Menu Items Panel */}
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="card-header border-0 bg-white" style={{ borderRadius: '20px 20px 0 0' }}>
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">🔍</span>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select bg-light border-0"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {menuCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredItems.length === 0 ? (
              <div className="text-center py-5">
                <div className="fs-1 mb-3">🍽️</div>
                <h5 className="text-muted">No menu items found</h5>
                <p className="text-muted">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="row g-3">
                {filteredItems.map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-4">
                    <div 
                      className="card border-0 shadow-sm h-100 cursor-pointer"
                      style={{ borderRadius: '15px', cursor: 'pointer' }}
                      onClick={() => addToCart(item)}
                    >
                      {item.image_url && (
                        <div style={{ height: '120px', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className="card-body p-3">
                        <h6 className="card-title mb-1">{item.name}</h6>
                        <p className="card-text text-muted small mb-2" style={{ fontSize: '0.85rem', height: '40px', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="h6 text-success mb-0 fw-bold">${parseFloat(item.price).toFixed(2)}</span>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                          >
                            + Add
                          </button>
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

      {/* Cart Panel */}
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="card-header border-0 bg-primary text-white" style={{ borderRadius: '20px 20px 0 0' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🛒 Order Cart</h5>
              <span className="badge bg-light text-primary">{cart.length}</span>
            </div>
          </div>
          
          <div className="card-body">
            {/* Customer Info */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Customer Information</h6>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Phone Number (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div className="text-center py-4">
                  <div className="fs-3 mb-2">🛒</div>
                  <p className="text-muted small">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                    <div className="flex-grow-1">
                      <h6 className="mb-0 small">{item.name}</h6>
                      <small className="text-success fw-bold">${parseFloat(item.price).toFixed(2)}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <button 
                        className="btn btn-outline-danger btn-sm me-2"
                        onClick={() => removeFromCart(item.id)}
                      >
                        -
                      </button>
                      <span className="fw-bold mx-2">{item.quantity}</span>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Special Instructions */}
            {cart.length > 0 && (
              <div className="mb-4">
                <textarea
                  className="form-control"
                  placeholder="Special instructions (optional)"
                  rows="2"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            )}

            {/* Total & Actions */}
            {cart.length > 0 && (
              <>
                <div className="border-top pt-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Total:</h5>
                    <h5 className="mb-0 text-success fw-bold">${getTotalAmount().toFixed(2)}</h5>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success btn-lg"
                    onClick={createOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>💳 Create Order</>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={clearCart}
                  >
                    🗑️ Clear Cart
                  </button>
                </div>

                {/* Cash Drawer Status */}
                <div className="mt-3 text-center">
                  <small className={`text-${drawerStatus.isConnected ? 'success' : 'muted'}`}>
                    💰 Cash Drawer: {drawerStatus.isConnected ? 'Connected' : 'Disconnected'}
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