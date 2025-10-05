import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import CartModal from "../components/CartModal";
import PaymentModal from "../components/PaymentModal";
import PaymentSelectionModal from "../components/PaymentSelectionModal";

export default function CustomerMenuFullScreen() {
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
      console.log("Looking for vendor with slug:", slug);
      
      // First, try to get vendor by slug
      let { data: vendorData, error: vendorError } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      // If slug lookup fails, try to find by business_name as fallback
      if (vendorError || !vendorData) {
        console.log("Slug lookup failed, trying business_name:", vendorError);
        
        // Try business name lookup (case insensitive)
        const { data: nameData, error: nameError } = await supabase
          .from("vendor_profiles")
          .select("*")
          .ilike("business_name", `%${slug.replace(/-/g, ' ')}%`)
          .single();
          
        if (nameError || !nameData) {
          console.log("Business name lookup also failed:", nameError);
          
          // Get all vendors for debugging
          const { data: allVendors } = await supabase
            .from("vendor_profiles")
            .select("id, business_name, slug");
            
          console.log("Available vendors:", allVendors);
          setError(`Food truck not found. Looking for: "${slug}". Available vendors: ${allVendors?.map(v => v.business_name || v.id).join(', ') || 'None'}`);
          setLoading(false);
          return;
        }
        
        vendorData = nameData;
      }

      console.log("Found vendor:", vendorData);

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
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Oops! {error}</h4>
            <p>Please check the QR code or contact the food truck directly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: vendor?.background_color || '#f8f9fa' }}>
      {/* Full-Width Header */}
      <div className="position-relative">
        {/* Banner Image */}
        <div className="position-relative" style={{ height: '240px', overflow: 'hidden' }}>
          {vendor?.banner_url ? (
            <img
              src={vendor.banner_url}
              alt={`${vendor.business_name} Banner`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="text-center text-white">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
                <h2 className="mb-0">Welcome to {vendor?.business_name}</h2>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div
            className="position-absolute w-100 h-100"
            style={{
              top: 0,
              left: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)'
            }}
          ></div>
        </div>
        
        {/* Restaurant Info Card */}
        <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="position-relative" style={{ marginTop: '-80px' }}>
            <div className="rounded-4 shadow-lg p-4 mx-3" style={{ backgroundColor: vendor?.header_color || '#ffffff' }}>
              <div className="row">
                <div className="col-auto">
                  {/* Profile Picture */}
                  {vendor?.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={`${vendor.business_name} Logo`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '20px',
                        border: `4px solid ${vendor?.header_color || '#ffffff'}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: '#007bff',
                        borderRadius: '20px',
                        border: `4px solid ${vendor?.header_color || '#ffffff'}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '2.5rem' }}>🍽️</span>
                    </div>
                  )}
                </div>
                
                <div className="col">
                  {/* Restaurant Details */}
                  <div className="row">
                    <div className="col-lg-8">
                      <h1 className="h2 fw-bold mb-2" style={{ color: '#1a1a1a' }}>
                        {vendor?.business_name}
                      </h1>
                      
                      {vendor?.description && (
                        <p className="text-muted mb-3" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                          {vendor.description}
                        </p>
                      )}
                      
                      {/* Info Tags */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-success" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          ⚡ 15-20 min
                        </span>
                        <span className="badge bg-info" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          🚀 QR Ordering
                        </span>
                        {vendor?.cuisine_type && (
                          <span className="badge bg-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            {vendor.cuisine_type === 'mexican' && '🌮 Mexican'}
                            {vendor.cuisine_type === 'american' && '🍔 American'}
                            {vendor.cuisine_type === 'italian' && '🍝 Italian'}
                            {vendor.cuisine_type === 'asian' && '🍜 Asian'}
                            {vendor.cuisine_type === 'jamaican' && '🏝️ Jamaican'}
                            {vendor.cuisine_type === 'haitian' && '🇭🇹 Haitian'}
                            {vendor.cuisine_type === 'puerto_rican' && '🇵🇷 Puerto Rican'}
                            {vendor.cuisine_type === 'indian' && '🍛 Indian'}
                            {vendor.cuisine_type === 'greek' && '🫒 Greek'}
                            {vendor.cuisine_type === 'middle_eastern' && '🥙 Middle Eastern'}
                            {vendor.cuisine_type === 'soul_food' && '🍗 Soul Food'}
                            {vendor.cuisine_type === 'desserts' && '🍰 Desserts'}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating & Reviews (placeholder) */}
                      <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '14px' }}>
                        <div className="d-flex align-items-center gap-1">
                          <span style={{ color: '#ffc107' }}>⭐</span>
                          <span className="fw-semibold">4.8</span>
                          <span>(120+ reviews)</span>
                        </div>
                        <span>•</span>
                        <span>$$</span>
                        <span>•</span>
                        <span>Fast Casual</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '2rem' }}>
        <div className="row">
          {/* Desktop Sidebar Filters */}
          <div className="col-xl-2 col-lg-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '2rem' }}>
              <div className="bg-white rounded-3 shadow-sm p-4">
                <h5 className="fw-bold mb-4">Categories</h5>
                <div className="d-flex flex-column gap-2">
                  {[
                    { id: 'all', name: 'All Items', icon: '🍽️' },
                    { id: 'mains', name: 'Main Dishes', icon: '🍔' },
                    { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
                    { id: 'sides', name: 'Sides', icon: '🍟' },
                    { id: 'drinks', name: 'Beverages', icon: '🥤' },
                    { id: 'desserts', name: 'Desserts', icon: '🍰' }
                  ].map(category => {
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        className={`btn w-100 text-start ${isActive ? 'btn-primary' : 'btn-outline-light'}`}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          fontSize: '15px',
                          fontWeight: '500',
                          border: isActive ? 'none' : '1px solid #e9ecef',
                          backgroundColor: isActive ? '#007bff' : 'transparent',
                          color: isActive ? 'white' : '#495057',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="me-2">{category.icon}</span>
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Category Filters */}
          <div className="col-12 d-lg-none mb-4">
            <div className="bg-white rounded-3 shadow-sm p-3">
              <div className="d-flex gap-2 overflow-auto category-scroll">
                {[
                  { id: 'all', name: 'All', icon: '🍽️' },
                  { id: 'mains', name: 'Mains', icon: '🍔' },
                  { id: 'appetizers', name: 'Apps', icon: '🥗' },
                  { id: 'sides', name: 'Sides', icon: '🍟' },
                  { id: 'drinks', name: 'Drinks', icon: '🥤' },
                  { id: 'desserts', name: 'Desserts', icon: '🍰' }
                ].map(category => {
                  const isActive = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      className={`btn flex-shrink-0 ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{
                        borderRadius: '20px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="me-1">{category.icon}</span>
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="col-xl-10 col-lg-9">
            {/* Menu Items */}
            {menuItems.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <div 
                    className="mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <span style={{ fontSize: '4rem' }}>🍽️</span>
                  </div>
                </div>
                <h3 className="text-muted mb-2">Menu Coming Soon!</h3>
                <p className="text-muted">Check back later for delicious options</p>
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
                        <div className="mb-4">
                          <h3 className="fw-bold mb-3" style={{ fontSize: '28px' }}>
                            {categoryName === 'mains' && '🍔 Main Dishes'}
                            {categoryName === 'appetizers' && '🥗 Appetizers & Starters'}
                            {categoryName === 'sides' && '🍟 Sides & Extras'}
                            {categoryName === 'drinks' && '🥤 Beverages'}
                            {categoryName === 'desserts' && '🍰 Desserts & Sweets'}
                            {categoryName === 'other' && '🍽️ Specialties'}
                          </h3>
                          <div className="bg-primary" style={{ height: '4px', width: '80px', borderRadius: '2px' }}></div>
                        </div>
                      )}
                      
                      <div className="row g-4">
                        {categoryItems.map((item) => (
                          <div key={item.id} className="col-xxl-3 col-xl-4 col-lg-6 col-md-6">
                            <div 
                              className="card border-0 shadow-sm h-100" 
                              style={{ cursor: 'pointer', borderRadius: '16px', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                              onClick={() => handleItemClick(item)}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-4px)';
                                e.target.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                              }}
                            >
                              {/* Image */}
                              <div className="position-relative">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="card-img-top"
                                    style={{ 
                                      height: '150px', 
                                      objectFit: 'cover',
                                      borderRadius: '16px 16px 0 0'
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="bg-light d-flex align-items-center justify-content-center"
                                    style={{ 
                                      height: '150px',
                                      borderRadius: '16px 16px 0 0'
                                    }}
                                  >
                                    <span style={{ fontSize: '3rem' }}>🍽️</span>
                                  </div>
                                )}
                                
                                {/* Cart Quantity Badge */}
                                {getCartItemQuantity(item.id) > 0 && (
                                  <div className="position-absolute top-0 end-0 m-3">
                                    <span 
                                      className="badge bg-success rounded-circle d-flex align-items-center justify-content-center"
                                      style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}
                                    >
                                      {getCartItemQuantity(item.id)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="card-body p-4 d-flex flex-column">
                                <div className="flex-grow-1">
                                  <h5 className="card-title fw-bold mb-2" style={{ fontSize: '18px', lineHeight: '1.3' }}>
                                    {item.name}
                                  </h5>
                                  
                                  <p 
                                    className="card-text text-muted mb-3" 
                                    style={{ 
                                      fontSize: '14px', 
                                      lineHeight: '1.5',
                                      display: '-webkit-box',
                                      WebkitLineClamp: '3',
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      height: '63px'
                                    }}
                                  >
                                    {item.description}
                                  </p>
                                  
                                  {item.category && (
                                    <span className="badge bg-light text-muted mb-3" style={{ fontSize: '12px' }}>
                                      {item.category}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Price and Add Button */}
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="fw-bold" style={{ fontSize: '20px', color: '#28a745' }}>
                                    ${item.price.toFixed(2)}
                                  </span>
                                  <button
                                    className="btn btn-primary"
                                    style={{ 
                                      borderRadius: '12px', 
                                      fontSize: '14px', 
                                      fontWeight: '600', 
                                      padding: '10px 24px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemClick(item);
                                    }}
                                  >
                                    Add to Cart
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
            <div style={{ height: cart.length > 0 ? "120px" : "40px" }}></div>
          </div>
        </div>
      </div>

      {/* Cart Summary (sticky bottom) */}
      {cart.length > 0 && (
        <div className="position-fixed bottom-0 start-0 w-100 p-3" style={{ zIndex: 1050 }}>
          <div className="container-fluid" style={{ maxWidth: "1400px", margin: '0 auto' }}>
            <div className="bg-success rounded-4 shadow-lg" style={{ padding: '20px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-white">
                  <div className="fw-bold" style={{ fontSize: '24px' }}>${getCartTotal().toFixed(2)}</div>
                  <div style={{ fontSize: '16px', opacity: 0.9 }}>
                    {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in cart
                  </div>
                </div>
                <button 
                  className="btn btn-light fw-bold"
                  style={{ 
                    borderRadius: '12px',
                    color: '#28a745',
                    padding: '12px 32px',
                    fontSize: '16px'
                  }}
                  onClick={() => setShowCartModal(true)}
                >
                  View Cart 🛒
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Modals - same as original */}
      <CartModal
        cart={cart}
        setCart={setCart}
        vendor={vendor}
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={handleCheckout}
      />

      <PaymentSelectionModal
        isOpen={showPaymentSelectionModal}
        onClose={() => setShowPaymentSelectionModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        orderData={pendingOrder}
        vendor={vendor}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={pendingOrder}
        onPaymentSuccess={handlePaymentSuccess}
        vendor={vendor}
      />

      {/* Item Customization Modal - same as original but larger */}
      {selectedItem && (
        <div className={`modal ${showItemModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
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
                  <div className="col-md-4">
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
                        <span className="text-muted" style={{ fontSize: '4rem' }}>🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <h3 className="fw-bold mb-3">{selectedItem.name}</h3>
                    <p className="text-muted mb-4" style={{ fontSize: '16px' }}>{selectedItem.description}</p>
                    <div className="d-flex align-items-center mb-3">
                      <span className="h2 fw-bold me-3" style={{ color: vendor?.primary_color || '#28a745' }}>
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
                  <h5 className="fw-bold mb-3">✨ Special Instructions & Customizations</h5>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="4"
                      style={{ borderRadius: '12px', resize: 'none', fontSize: '15px' }}
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
                    <h6 className="fw-semibold mb-3">Quick Options:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        'No onions', 'Extra cheese', 'Spicy 🌶️', 'No pickles', 
                        'Extra sauce', 'Well done', 'Medium rare', 'On the side'
                      ].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          style={{ borderRadius: '20px', fontSize: '14px' }}
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
                  className="btn btn-secondary me-3" 
                  style={{ borderRadius: '12px', padding: '12px 24px' }}
                  onClick={() => setShowItemModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-lg fw-bold text-white" 
                  style={{
                    background: vendor?.primary_color && vendor?.secondary_color 
                      ? `linear-gradient(45deg, ${vendor.primary_color}, ${vendor.secondary_color})` 
                      : 'linear-gradient(45deg, #007bff, #6f42c1)',
                    borderRadius: '15px',
                    border: 'none',
                    padding: '12px 32px'
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