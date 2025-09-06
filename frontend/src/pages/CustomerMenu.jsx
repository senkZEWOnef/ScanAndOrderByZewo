import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import CartModal from "../components/CartModal";
import PaymentModal from "../components/PaymentModal";
import PaymentSelectionModal from "../components/PaymentSelectionModal";

export default function CustomerMenu() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentSelectionModal, setShowPaymentSelectionModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCustomizations, setItemCustomizations] = useState('');

  useEffect(() => {
    fetchVendorAndMenu();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVendorAndMenu = async () => {
    try {
      // Get vendor by slug
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (vendorError) {
        setError("Food truck not found");
        setLoading(false);
        return;
      }

      setVendor(vendorData);

      // Get menu items for this vendor
      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("vendor_id", vendorData.id)
        .order("created_at", { ascending: false });

      if (menuError) {
        setError("Error loading menu");
      } else {
        setMenuItems(menuData);
      }
    } catch (error) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const addToCart = (item, customizations = '') => {
    const itemWithCustomizations = {
      ...item,
      customizations,
      uniqueId: `${item.id}_${Date.now()}_${Math.random()}` // Unique ID for items with different customizations
    };
    
    // If item has customizations, always add as new item
    if (customizations) {
      setCart([...cart, { ...itemWithCustomizations, quantity: 1 }]);
    } else {
      // Check if same item without customizations exists
      const existingItem = cart.find((cartItem) => cartItem.id === item.id && !cartItem.customizations);
      if (existingItem) {
        setCart(
          cart.map((cartItem) =>
            cartItem.id === item.id && !cartItem.customizations
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      } else {
        setCart([...cart, { ...itemWithCustomizations, quantity: 1 }]);
      }
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

  const getCartItemQuantity = (itemId) => {
    // Count all items with this ID regardless of customizations
    return cart.filter(cartItem => cartItem.id === itemId).reduce((total, item) => total + item.quantity, 0);
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
  
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setItemCustomizations('');
    setShowItemModal(true);
  };
  
  const handleAddWithCustomizations = () => {
    addToCart(selectedItem, itemCustomizations);
    setShowItemModal(false);
    setSelectedItem(null);
    setItemCustomizations('');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async (checkoutData) => {
    // Store checkout data and show payment selection modal
    setPendingOrder({
      total: checkoutData.total,
      items: checkoutData.items,
      phone: checkoutData.phone,
      instructions: checkoutData.instructions,
      vendorName: vendor.business_name
    });
    setShowCartModal(false);
    setShowPaymentSelectionModal(true);
  };

  const handlePaymentMethodSelect = async (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    
    try {
      // Create or get customer
      let customerId;
      const phone = pendingOrder.phone.replace(/\D/g, '');
      
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
          .insert([{ phone }])
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

      // Determine payment status based on method
      let paymentStatus = 'pending';
      let orderStatus = 'pending';
      
      if (paymentMethod.id === 'cash') {
        paymentStatus = 'pending_cash';
        orderStatus = 'pending_payment';
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          vendor_id: vendor.id,
          customer_id: customerId,
          order_number: orderNumber,
          status: orderStatus,
          total_amount: pendingOrder.total,
          payment_status: paymentStatus,
          payment_method: paymentMethod.id,
          special_instructions: pendingOrder.instructions || null,
          estimated_ready_time: new Date(Date.now() + 20 * 60 * 1000), // 20 min from now
          order_type: 'qr_code'
        }])
        .select()
        .single();

      if (orderError) {
        alert("Error creating order");
        console.error(orderError);
        return;
      }

      // Create order items
      const orderItems = pendingOrder.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        alert("Error saving order items");
        console.error(itemsError);
        return;
      }

      // Update pending order with complete info
      setPendingOrder({
        id: order.id,
        orderNumber: orderNumber,
        total: pendingOrder.total,
        items: pendingOrder.items,
        vendorName: vendor.business_name,
        customerId: customerId,
        paymentMethod: paymentMethod
      });

      if (paymentMethod.id === 'cash') {
        // For cash payments, go directly to confirmation
        handleCashPaymentSuccess();
      } else {
        // For card/ATH Móvil, show payment modal
        setShowPaymentModal(true);
      }

    } catch (error) {
      console.error("Order creation error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleCashPaymentSuccess = async () => {
    try {
      // Get customer phone for tracking URL
      const { data: customer } = await supabase
        .from("customers")
        .select("phone")
        .eq("id", pendingOrder.customerId)
        .single();

      // Close modals and clear cart
      setShowPaymentSelectionModal(false);
      setShowPaymentModal(false);
      setPendingOrder(null);
      setCart([]);
      
      // Redirect to order tracking page with cash payment notice
      const phone = customer?.phone || "0000000000";
      navigate(`/track/${pendingOrder.orderNumber}?phone=${phone}&payment=cash`);
      
    } catch (error) {
      console.error("Cash payment redirect error:", error);
      alert("Order placed! Please check your order status.");
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Update order with payment info
      await supabase
        .from("orders")
        .update({
          payment_status: paymentData.status,
          payment_intent_id: paymentData.paymentIntentId || null
        })
        .eq("id", pendingOrder.id);

      // Get customer phone for tracking URL
      const { data: customer } = await supabase
        .from("customers")
        .select("phone")
        .eq("id", pendingOrder.customerId)
        .single();

      // Close modals and clear cart
      setShowPaymentModal(false);
      setPendingOrder(null);
      setCart([]);
      
      // Redirect to order tracking page
      const phone = customer?.phone || "0000000000";
      navigate(`/track/${pendingOrder.orderNumber}?phone=${phone}`);
      
    } catch (error) {
      console.error("Payment update error:", error);
      alert("Order placed but payment status update failed. Please contact the vendor.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Oops! {error}</h4>
          <p>Please check the QR code or contact the food truck directly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--color-gray-50)' }}>
      {/* Professional Header */}
      <div className="bg-white sticky-top" style={{ borderBottom: '1px solid var(--color-gray-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="container-modern py-6" style={{ maxWidth: "640px" }}>
          <div className="text-center">
            {/* Business Logo */}
            <div className="mb-4">
              {vendor?.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={`${vendor.business_name} Logo`}
                  style={{ 
                    width: '88px', 
                    height: '88px', 
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-xl)',
                    border: '3px solid var(--color-primary)'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '88px', 
                  height: '88px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <span style={{ color: 'white', fontSize: '2rem' }}>🍽️</span>
                </div>
              )}
            </div>
            
            <h1 className="heading-2-modern mb-3">{vendor.business_name}</h1>
            
            {vendor?.description && (
              <p className="text-muted-modern mb-4" style={{ fontSize: 'var(--text-lg)' }}>{vendor.description}</p>
            )}
            
            <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
              <div className="d-flex align-items-center gap-1">
                <span>📱</span>
                <span>Scan</span>
              </div>
              <div style={{ width: '4px', height: '4px', backgroundColor: 'var(--color-gray-400)', borderRadius: '50%' }}></div>
              <div className="d-flex align-items-center gap-1">
                <span>🛒</span>
                <span>Order</span>
              </div>
              <div style={{ width: '4px', height: '4px', backgroundColor: 'var(--color-gray-400)', borderRadius: '50%' }}></div>
              <div className="d-flex align-items-center gap-1">
                <span>💳</span>
                <span>Pay</span>
              </div>
              <div style={{ width: '4px', height: '4px', backgroundColor: 'var(--color-gray-400)', borderRadius: '50%' }}></div>
              <div className="d-flex align-items-center gap-1">
                <span>🎯</span>
                <span>Pickup</span>
              </div>
            </div>
            
            <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
              <div className="badge-modern badge-success-modern">
                ⚡ Ready in 15-20 min
              </div>
              <div className="badge-modern badge-info-modern">
                💳 Secure Payment
              </div>
              <div className="badge-modern badge-info-modern">
                📱 Mobile Ordering
              </div>
            </div>
            
            {/* Cuisine Type Badge */}
            {vendor?.cuisine_type && (
              <div>
                <span className="badge-modern" style={{ backgroundColor: 'var(--color-gray-200)', color: 'var(--color-gray-700)' }}>
                  {vendor.cuisine_type === 'mexican' && '🌮 Mexican Cuisine'}
                  {vendor.cuisine_type === 'american' && '🍔 American Food'}
                  {vendor.cuisine_type === 'italian' && '🍝 Italian Kitchen'}
                  {vendor.cuisine_type === 'asian' && '🍜 Asian Flavors'}
                  {vendor.cuisine_type === 'jamaican' && '🏝️ Jamaican Spice'}
                  {vendor.cuisine_type === 'haitian' && '🇭🇹 Haitian Cuisine'}
                  {vendor.cuisine_type === 'puerto_rican' && '🇵🇷 Puerto Rican Food'}
                  {vendor.cuisine_type === 'indian' && '🍛 Indian Cuisine'}
                  {vendor.cuisine_type === 'greek' && '🫒 Greek Food'}
                  {vendor.cuisine_type === 'middle_eastern' && '🥙 Middle Eastern'}
                  {vendor.cuisine_type === 'soul_food' && '🍗 Soul Food'}
                  {vendor.cuisine_type === 'desserts' && '🍰 Sweet Treats'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-modern py-6" style={{ maxWidth: "640px" }}>

        {/* Cart Summary (sticky) */}
        {cart.length > 0 && (
          <div className="position-fixed bottom-0 start-0 w-100 p-4" style={{ zIndex: 1050 }}>
            <div className="container-modern" style={{ maxWidth: "640px" }}>
              <div className="card-modern" 
                   style={{ 
                     backgroundColor: 'var(--color-success)',
                     border: 'none',
                     boxShadow: 'var(--shadow-xl)'
                   }}>
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-white">
                      <div className="fw-bold" style={{ fontSize: 'var(--text-2xl)' }}>${getCartTotal().toFixed(2)}</div>
                      <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>{getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in cart</div>
                    </div>
                    <button 
                      className="btn-modern btn-lg-modern fw-bold"
                      style={{ 
                        backgroundColor: 'white',
                        color: 'var(--color-success)',
                        border: '2px solid white',
                        padding: 'var(--space-3) var(--space-6)'
                      }}
                      onClick={() => setShowCartModal(true)}
                    >
                      View Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="mb-6">
          <div className="nav-tabs-modern">
            {[
              { id: 'all', name: 'All' },
              { id: 'mains', name: 'Mains' },
              { id: 'appetizers', name: 'Appetizers' },
              { id: 'sides', name: 'Sides' },
              { id: 'drinks', name: 'Drinks' },
              { id: 'desserts', name: 'Desserts' }
            ].map(category => (
              <button
                key={category.id}
                className={`nav-tab-modern ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items by Category */}
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <div style={{ 
              width: '120px', 
              height: '120px',
              backgroundColor: 'var(--color-gray-100)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6) auto'
            }}>
              <span style={{ fontSize: '3rem' }}>🍽️</span>
            </div>
            <h2 className="heading-3-modern text-muted-modern mb-3">Menu Coming Soon!</h2>
            <p className="text-muted-modern">Check back later for delicious options</p>
          </div>
        ) : (
          (() => {
            const categories = categorizeMenuItems();
            const categoriesToShow = selectedCategory === 'all' 
              ? Object.entries(categories).filter(([_, items]) => items.length > 0)
              : [[selectedCategory, categories[selectedCategory] || []]];

            return categoriesToShow.map(([categoryName, categoryItems]) => (
              categoryItems.length > 0 && (
                <div key={categoryName} className="mb-5">
                  {selectedCategory === 'all' && (
                    <div className="d-flex align-items-center mb-4">
                      <div className="flex-grow-1">
                        <h4 className="fw-bold mb-1 text-dark">
                          {categoryName === 'mains' && '🍔 Main Dishes'}
                          {categoryName === 'appetizers' && '🥗 Appetizers & Starters'}
                          {categoryName === 'sides' && '🍟 Sides & Extras'}
                          {categoryName === 'drinks' && '🥤 Beverages'}
                          {categoryName === 'desserts' && '🍰 Desserts & Sweets'}
                          {categoryName === 'other' && '🍽️ Specialties'}
                        </h4>
                        <div className="bg-primary" style={{ height: '3px', width: '50px', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="ipad-card-grid">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="fade-in-modern">
                        <div className="card-modern hover-lift-modern h-100" 
                             style={{ cursor: 'pointer' }}
                             onClick={() => handleItemClick(item)}
                        >
                          {/* Image */}
                          <div className="position-relative">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{ 
                                  width: '100%',
                                  height: "180px", 
                                  objectFit: "cover",
                                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                                }}
                              />
                            ) : (
                              <div
                                style={{ 
                                  width: '100%',
                                  height: "180px",
                                  backgroundColor: 'var(--color-gray-100)',
                                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <span style={{ fontSize: '3rem' }}>🍽️</span>
                              </div>
                            )}
                            
                            {/* Badges */}
                            <div className="position-absolute" style={{ top: 'var(--space-3)', left: 'var(--space-3)' }}>
                              <span className="badge-modern badge-success-modern">
                                Fresh
                              </span>
                            </div>
                            
                            {/* Cart Quantity Badge */}
                            {getCartItemQuantity(item.id) > 0 && (
                              <div className="position-absolute" style={{ top: 'var(--space-3)', right: 'var(--space-3)' }}>
                                <div style={{ 
                                  width: '32px', 
                                  height: '32px',
                                  backgroundColor: 'var(--color-success)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span style={{ color: 'white', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)' }}>
                                    {getCartItemQuantity(item.id)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Price Badge */}
                            <div className="position-absolute" style={{ bottom: 'var(--space-3)', right: 'var(--space-3)' }}>
                              <span className="badge-modern" style={{ 
                                backgroundColor: 'var(--color-success)',
                                color: 'white',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-bold)'
                              }}>
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <h3 className="fw-bold mb-2" 
                                style={{ 
                                  fontSize: 'var(--text-lg)',
                                  lineHeight: '1.3',
                                  color: 'var(--color-gray-800)',
                                  height: '2.6em',
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: '2',
                                  WebkitBoxOrient: 'vertical'
                                }}>
                              {item.name}
                            </h3>
                            
                            <p className="text-muted-modern mb-4" 
                               style={{ 
                                 fontSize: 'var(--text-sm)',
                                 lineHeight: '1.4',
                                 height: '4.2em',
                                 overflow: 'hidden',
                                 display: '-webkit-box',
                                 WebkitLineClamp: '3',
                                 WebkitBoxOrient: 'vertical'
                               }}>
                              {item.description}
                            </p>
                            
                            {/* Bottom Section */}
                            <div className="d-flex justify-content-between align-items-center">
                              {/* Category Badge */}
                              <div>
                                {item.category && (
                                  <span className="badge-modern" style={{ backgroundColor: 'var(--color-gray-200)', color: 'var(--color-gray-600)' }}>
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              
                              {/* Add Button */}
                              <button
                                className="btn-modern btn-primary-modern fw-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemClick(item);
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ));
          })()
        )}

        {/* Bottom spacing for fixed cart */}
        <div style={{ height: cart.length > 0 ? "140px" : "40px" }}></div>
      </div>

      {/* Cart Modal */}
      <CartModal
        cart={cart}
        setCart={setCart}
        vendor={vendor}
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={handleCheckout}
      />

      {/* Payment Selection Modal */}
      <PaymentSelectionModal
        isOpen={showPaymentSelectionModal}
        onClose={() => setShowPaymentSelectionModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        orderData={pendingOrder}
        vendor={vendor}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={pendingOrder}
        onPaymentSuccess={handlePaymentSuccess}
        vendor={vendor}
      />

      {/* Item Customization Modal */}
      {selectedItem && (
        <div className={`modal ${showItemModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 p-4" style={{
                background: vendor?.primary_color && vendor?.secondary_color 
                  ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
                  : 'linear-gradient(45deg, #007bff, #6f42c1)'
              }}>
                <div className="text-white">
                  <h4 className="modal-title fw-bold mb-0">🍽️ Customize Your Order</h4>
                  <p className="mb-0 opacity-90">{selectedItem.name}</p>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowItemModal(false)}
                ></button>
              </div>
              
              <div className="modal-body p-4">
                {/* Item Details */}
                <div className="row mb-4">
                  <div className="col-4">
                    {selectedItem.image_url ? (
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.name}
                        className="img-fluid rounded-3"
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                           style={{ height: '150px' }}>
                        <span className="text-muted fs-1">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="col-8">
                    <h5 className="fw-bold">{selectedItem.name}</h5>
                    <p className="text-muted mb-3">{selectedItem.description}</p>
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-3 fw-bold me-3" style={{ color: vendor?.primary_color || '#28a745' }}>
                        ${selectedItem.price.toFixed(2)}
                      </span>
                      {selectedItem.category && (
                        <span className="badge bg-light text-dark">{selectedItem.category}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customization Section */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">✨ Special Instructions & Customizations</h6>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="4"
                      style={{ borderRadius: '12px', resize: 'none' }}
                      placeholder="Add your special requests here...

Examples:
• No onions, extra pickles
• Make it spicy! 🌶️
• Light on the sauce
• Extra cheese
• No tomatoes
• Well done
• On the side
• Any allergies or dietary requirements"
                      value={itemCustomizations}
                      onChange={(e) => setItemCustomizations(e.target.value)}
                      maxLength="200"
                    />
                    <div className="form-text text-end">
                      {itemCustomizations.length}/200 characters
                    </div>
                  </div>
                  
                  {/* Quick Options */}
                  <div className="mb-3">
                    <h6 className="fw-semibold mb-2">Quick Options:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        'No onions', 'Extra cheese', 'Spicy 🌶️', 'No pickles', 
                        'Extra sauce', 'Well done', 'Medium rare', 'On the side'
                      ].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          style={{ borderRadius: '20px', fontSize: '12px' }}
                          onClick={() => {
                            const currentText = itemCustomizations;
                            const newText = currentText 
                              ? `${currentText}, ${option}` 
                              : option;
                            if (newText.length <= 200) {
                              setItemCustomizations(newText);
                            }
                          }}
                        >
                          + {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Allergy Warning */}
                <div className="alert alert-warning border-0" style={{ borderRadius: '12px' }}>
                  <small>
                    <strong>⚠️ Allergy Notice:</strong> Please inform us of any food allergies or dietary restrictions. 
                    While we'll do our best to accommodate, we cannot guarantee complete separation from allergens.
                  </small>
                </div>
              </div>
              
              <div className="modal-footer border-0 p-4">
                <button 
                  type="button" 
                  className="btn btn-secondary me-2" 
                  style={{ borderRadius: '12px' }}
                  onClick={() => setShowItemModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-lg fw-bold text-white px-4" 
                  style={{
                    background: vendor?.primary_color && vendor?.secondary_color 
                      ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
                      : 'linear-gradient(45deg, #007bff, #6f42c1)',
                    borderRadius: '15px',
                    border: 'none'
                  }}
                  onClick={handleAddWithCustomizations}
                >
                  🛒 Add to Cart - ${selectedItem.price.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}