import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import OrderManagement from "../components/OrderManagement";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BusinessCustomization from "../components/BusinessCustomization";
import FoodLibraryModal from "../components/FoodLibraryModal";
import CashierOrder from "../components/CashierOrder";
import CashDrawerSettings from "../components/CashDrawerSettings";
import { massiveFoodLibrary, cuisineTemplates } from "../data/massiveFoodLibrary";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFoodLibrary, setShowFoodLibrary] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [isPopulating, setIsPopulating] = useState(false);
  const [language, setLanguage] = useState('es'); // Default to Spanish

  const translations = {
    es: {
      dashboard: "Panel de Control",
      menu: "Menú",
      orders: "Pedidos",
      analytics: "Análisis",
      cashier: "Caja",
      settings: "Configuración",
      logout: "Cerrar Sesión",
      welcome: "¡Bienvenido!",
      businessName: "Nombre del Negocio",
      totalSales: "Ventas Totales",
      todayOrders: "Pedidos de Hoy",
      avgOrderValue: "Valor Promedio del Pedido",
      menuItems: "Elementos del Menú",
      addNewItem: "Agregar Nuevo Elemento",
      itemName: "Nombre del Elemento",
      description: "Descripción",
      price: "Precio",
      category: "Categoría",
      save: "Guardar",
      edit: "Editar",
      delete: "Eliminar",
      noItems: "No hay elementos en el menú",
      loading: "Cargando Panel...",
      pleaseWait: "Por favor espera mientras cargamos tus datos"
    },
    en: {
      dashboard: "Dashboard",
      menu: "Menu",
      orders: "Orders", 
      analytics: "Analytics",
      cashier: "Cashier",
      settings: "Settings",
      logout: "Logout",
      welcome: "Welcome!",
      businessName: "Business Name",
      totalSales: "Total Sales",
      todayOrders: "Today's Orders",
      avgOrderValue: "Avg Order Value",
      menuItems: "Menu Items",
      addNewItem: "Add New Item",
      itemName: "Item Name",
      description: "Description",
      price: "Price",
      category: "Category",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      noItems: "No menu items found",
      loading: "Loading Dashboard...",
      pleaseWait: "Please wait while we load your data"
    }
  };

  const t = translations[language];

  // Menu categories with modern icons
  const menuCategories = [
    { value: '', label: 'Select Category (Optional)', icon: '📋' },
    { value: 'appetizer', label: 'Appetizers & Starters', icon: '🥗' },
    { value: 'main', label: 'Main Dishes', icon: '🍔' },
    { value: 'side', label: 'Sides & Extras', icon: '🍟' },
    { value: 'drink', label: 'Beverages & Drinks', icon: '🥤' },
    { value: 'dessert', label: 'Desserts & Sweets', icon: '🍰' },
    { value: 'combo', label: 'Combo Meals', icon: '🍽️' },
    { value: 'special', label: 'Chef Specials', icon: '⭐' },
    { value: 'other', label: 'Other', icon: '🍽️' }
  ];

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/vendor-login');
          return;
        }

        setUser(session.user);
        await fetchVendorProfile(session.user.id);
        await fetchMenuItems(session.user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/vendor-login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchVendorProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setVendorProfile(data);
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const fetchMenuItems = async (userId) => {
    try {
      console.log('📋 Fetching menu items for vendor:', userId);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('📋 Fetched menu items:', data);
      console.log('📋 Menu items count:', data?.length || 0);
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Food Library functions
  const handleAddFromLibrary = async (item) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([
          {
            vendor_id: user.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            category: item.category,
            image_url: item.image_url,
          },
        ]);

      if (error) throw error;
      
      await fetchMenuItems(user.id);
      alert(`${item.name} added to your menu!`);
    } catch (error) {
      console.error('Error adding item from library:', error);
      alert('Error adding item to menu');
    }
  };

  const handlePopulateMenu = async (cuisineType) => {
    if (!cuisineType || !massiveFoodLibrary[cuisineType]) {
      alert('Please select a valid cuisine type');
      return;
    }

    setIsPopulating(true);
    
    try {
      const items = massiveFoodLibrary[cuisineType];
      const menuItemsToInsert = items.map(item => ({
        vendor_id: user.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        image_url: item.image_url,
      }));

      const { data, error } = await supabase
        .from('menu_items')
        .insert(menuItemsToInsert);

      if (error) throw error;
      
      await fetchMenuItems(user.id);
      setShowFoodLibrary(false);
      alert(`Successfully added ${items.length} ${cuisineType} items to your menu!`);
    } catch (error) {
      console.error('Error populating menu:', error);
      alert('Error populating menu. Some items may already exist.');
    } finally {
      setIsPopulating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }}></div>
          <h4 className="fw-bold">{t.loading}</h4>
          <p className="opacity-75">{t.pleaseWait}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div className="bg-white shadow-lg" style={{ width: '280px', minHeight: '100vh' }}>
        {/* Logo/Brand */}
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle me-3 d-flex align-items-center justify-content-center"
              style={{ 
                width: '45px', 
                height: '45px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              }}
            >
              <span className="text-white fw-bold">EP</span>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Escanea <span style={{ color: '#667eea' }}>PR</span></h5>
              <small className="text-muted">{vendorProfile?.business_name || 'Dashboard'}</small>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3">
          <nav>
            <div className="nav flex-column">
              <button 
                className={`nav-link border-0 text-start p-3 mb-2 rounded ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-dark'}`}
                onClick={() => setActiveTab('dashboard')}
                style={{ transition: 'all 0.2s' }}
              >
                <i className="me-3">📊</i>
                {t.dashboard}
              </button>
              
              <button 
                className={`nav-link border-0 text-start p-3 mb-2 rounded ${activeTab === 'menu' ? 'bg-primary text-white' : 'text-dark'}`}
                onClick={() => setActiveTab('menu')}
                style={{ transition: 'all 0.2s' }}
              >
                <i className="me-3">🍽️</i>
                {t.menu}
              </button>
              
              <button 
                className={`nav-link border-0 text-start p-3 mb-2 rounded ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-dark'}`}
                onClick={() => setActiveTab('orders')}
                style={{ transition: 'all 0.2s' }}
              >
                <i className="me-3">📋</i>
                {t.orders}
              </button>
              
              <button 
                className={`nav-link border-0 text-start p-3 mb-2 rounded ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-dark'}`}
                onClick={() => setActiveTab('analytics')}
                style={{ transition: 'all 0.2s' }}
              >
                <i className="me-3">📈</i>
                {t.analytics}
              </button>
              
              <button 
                className={`nav-link border-0 text-start p-3 mb-2 rounded ${activeTab === 'cashier' ? 'bg-primary text-white' : 'text-dark'}`}
                onClick={() => setActiveTab('cashier')}
                style={{ transition: 'all 0.2s' }}
              >
                <i className="me-3">💰</i>
                {t.cashier}
              </button>

              <hr className="my-3" />

              <button 
                className="nav-link border-0 text-start p-3 mb-2 rounded text-dark"
                onClick={() => navigate('/vendor-dashboard/customize')}
                style={{ transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <i className="me-3">🎨</i>
                Customize Restaurant
              </button>
            </div>
          </nav>
        </div>

        {/* QR Code Section */}
        <div className="p-3 border-top mt-auto">
          <div className="card border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body p-3 text-white text-center">
              <div className="mb-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}/menu/${vendorProfile?.slug || user?.id}`)}`}
                  alt="QR Code"
                  className="rounded bg-white p-1"
                  style={{ width: '60px', height: '60px' }}
                />
              </div>
              <small className="d-block mb-2 opacity-75">Customer Menu QR</small>
              <div className="d-flex gap-1">
                <button 
                  className="btn btn-light btn-sm flex-fill"
                  style={{ fontSize: '10px' }}
                  onClick={() => window.open(`${window.location.origin}/menu/${vendorProfile?.slug || user?.id}`, '_blank')}
                >
                  View
                </button>
                <button 
                  className="btn btn-outline-light btn-sm flex-fill"
                  style={{ fontSize: '10px' }}
                  onClick={() => {
                    const menuUrl = `${window.location.origin}/menu/${vendorProfile?.slug || user?.id}`;
                    navigator.clipboard.writeText(menuUrl);
                    alert(language === 'es' ? '¡Enlace copiado!' : 'Link copied!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="p-3 border-top">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-secondary"
                style={{ width: '32px', height: '32px' }}
              >
                <span className="text-white" style={{ fontSize: '12px' }}>👤</span>
              </div>
              <div>
                <small className="fw-semibold d-block" style={{ fontSize: '11px' }}>
                  {vendorProfile?.business_name || user?.email}
                </small>
                <small className="text-muted" style={{ fontSize: '10px' }}>
                  {user?.email}
                </small>
              </div>
            </div>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={handleLogout}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="p-3 pt-0">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="btn btn-light btn-sm w-100"
            style={{ fontSize: '12px' }}
          >
            <span style={{ fontSize: '16px' }}>{language === 'es' ? '🇺🇸' : '🇵🇷'}</span>
            <span className="ms-2">{language === 'es' ? 'English' : 'Español'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-fill">
        {/* Top Header */}
        <div className="bg-white shadow-sm p-4 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1 fw-bold">
                {activeTab === 'dashboard' && t.dashboard}
                {activeTab === 'menu' && t.menu}
                {activeTab === 'orders' && t.orders}
                {activeTab === 'analytics' && t.analytics}
                {activeTab === 'cashier' && t.cashier}
              </h4>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                {t.welcome} {vendorProfile?.business_name || user?.email}
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">
                {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </small>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body text-center p-4">
                    <div className="text-primary fs-1 mb-3">💰</div>
                    <h5 className="card-title">{t.totalSales}</h5>
                    <h3 className="text-primary fw-bold">$2,450.00</h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body text-center p-4">
                    <div className="text-success fs-1 mb-3">📦</div>
                    <h5 className="card-title">{t.todayOrders}</h5>
                    <h3 className="text-success fw-bold">24</h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body text-center p-4">
                    <div className="text-warning fs-1 mb-3">💳</div>
                    <h5 className="card-title">{t.avgOrderValue}</h5>
                    <h3 className="text-warning fw-bold">$18.50</h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body text-center p-4">
                    <div className="text-info fs-1 mb-3">🍽️</div>
                    <h5 className="card-title">{t.menuItems}</h5>
                    <h3 className="text-info fw-bold">{menuItems.length}</h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>{t.menu}</h2>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setShowFoodLibrary(true)}
                >
                  📚 Food Library
                </button>
                <button className="btn btn-primary">
                  + {t.addNewItem}
                </button>
              </div>
            </div>

            {(() => {
              console.log('🍽️ Menu items in render:', menuItems);
              console.log('🍽️ Menu items length:', menuItems.length);
              return menuItems.length === 0;
            })() ? (
              <div className="text-center py-5">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                  <div className="card-body p-5">
                    <div className="fs-1 mb-3">🍽️</div>
                    <h4 className="text-muted">{t.noItems}</h4>
                    <p className="text-muted mb-4">Add your first menu item to get started</p>
                    <div className="d-flex gap-3 justify-content-center">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowFoodLibrary(true)}
                      >
                        📚 Browse Food Library
                      </button>
                      <button className="btn btn-outline-primary">
                        + {t.addNewItem}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Menu Categories */}
                {menuCategories.slice(1).map(category => {
                  const categoryItems = menuItems.filter(item => item.category === category.value);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category.value} className="mb-5">
                      <div className="d-flex align-items-center mb-3">
                        <span className="fs-2 me-3">{category.icon}</span>
                        <h3 className="mb-0">{category.label}</h3>
                        <span className="badge bg-primary ms-2">{categoryItems.length}</span>
                      </div>
                      
                      <div className="row g-4">
                        {categoryItems.map((item) => (
                          <div key={item.id} className="col-lg-3 col-md-4 col-sm-6">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                              {item.image_url && (
                                <div style={{ height: '140px', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                              )}
                              <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h5 className="card-title mb-0 text-dark">{item.name}</h5>
                                  <span className="badge bg-light text-dark">{category.icon}</span>
                                </div>
                                <p className="card-text text-secondary small mb-3" style={{ height: '60px', overflow: 'hidden' }}>
                                  {item.description}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="h5 text-success mb-0 fw-bold">${parseFloat(item.price).toFixed(2)}</span>
                                  <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-primary">
                                      {t.edit}
                                    </button>
                                    <button className="btn btn-outline-danger">
                                      {t.delete}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Uncategorized Items */}
                {menuItems.filter(item => !item.category || item.category === '').length > 0 && (
                  <div className="mb-5">
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-2 me-3">📋</span>
                      <h3 className="mb-0">Uncategorized</h3>
                      <span className="badge bg-secondary ms-2">
                        {menuItems.filter(item => !item.category || item.category === '').length}
                      </span>
                    </div>
                    
                    <div className="row g-4">
                      {menuItems.filter(item => !item.category || item.category === '').map((item) => (
                        <div key={item.id} className="col-lg-3 col-md-4 col-sm-6">
                          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                            {item.image_url && (
                              <div style={{ height: '140px', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            )}
                            <div className="card-body p-4">
                              <h5 className="card-title text-dark">{item.name}</h5>
                              <p className="card-text text-secondary small mb-3" style={{ height: '60px', overflow: 'hidden' }}>
                                {item.description}
                              </p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="h5 text-success mb-0 fw-bold">${parseFloat(item.price).toFixed(2)}</span>
                                <div className="btn-group btn-group-sm">
                                  <button className="btn btn-outline-primary">
                                    {t.edit}
                                  </button>
                                  <button className="btn btn-outline-danger">
                                    {t.delete}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <OrderManagement user={user} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard user={user} />
        )}

        {activeTab === 'cashier' && (
          <CashierOrder user={user} onOrderCreated={() => fetchMenuItems(user.id)} />
        )}
        </div>
      </div>

      {/* Food Library Modal */}
      {showFoodLibrary && (
        <FoodLibraryModal
          isOpen={showFoodLibrary}
          onClose={() => setShowFoodLibrary(false)}
          onAddItem={handleAddFromLibrary}
          onPopulateMenu={handlePopulateMenu}
        />
      )}
    </div>
  );
}