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
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Language Toggle */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="btn btn-light btn-sm shadow-sm"
          style={{ borderRadius: '50%', width: '50px', height: '50px' }}
        >
          <span style={{ fontSize: '20px' }}>{language === 'es' ? '🇺🇸' : '🇵🇷'}</span>
        </button>
      </div>

      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container-fluid px-4">
          <span className="navbar-brand fw-bold fs-4">
            Escanea <span className="text-warning">PR</span>
          </span>
          
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              {t.welcome} {vendorProfile?.business_name || user?.email}
            </span>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              {t.logout}
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="container-fluid px-4 py-3">
        <ul className="nav nav-pills nav-fill">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 {t.dashboard}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              🍽️ {t.menu}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 {t.orders}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 {t.analytics}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'cashier' ? 'active' : ''}`}
              onClick={() => setActiveTab('cashier')}
            >
              💰 {t.cashier}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="container-fluid px-4 pb-5">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="mb-4">{t.dashboard}</h2>
            
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

            {/* QR Code Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="card-body p-4 text-white">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h5 className="card-title text-white mb-2">📱 Customer QR Code</h5>
                        <p className="mb-3 opacity-75">
                          {language === 'es' 
                            ? 'Los clientes escanean este código QR para ver tu menú, hacer pedidos y pagar con Stripe o ATH Móvil'
                            : 'Customers scan this QR code to view your menu, place orders, and pay with Stripe or ATH Móvil'
                          }
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                          <button 
                            className="btn btn-light btn-sm"
                            onClick={() => window.open(`${window.location.origin}/menu/${vendorProfile?.slug || user?.id}`, '_blank')}
                          >
                            🔗 {language === 'es' ? 'Ver Menú' : 'View Menu'}
                          </button>
                          <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={() => {
                              const menuUrl = `${window.location.origin}/menu/${vendorProfile?.slug || user?.id}`;
                              navigator.clipboard.writeText(menuUrl);
                              alert(language === 'es' ? '¡Enlace copiado!' : 'Link copied!');
                            }}
                          >
                            📋 {language === 'es' ? 'Copiar Enlace' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                      <div className="col-md-4 text-center">
                        <div className="bg-white p-3 rounded-3 d-inline-block">
                          <div id="qr-code" style={{ width: '150px', height: '150px' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/menu/${vendorProfile?.slug || user?.id}`)}`}
                              alt="QR Code"
                              className="w-100 h-100"
                              style={{ borderRadius: '8px' }}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <small className="text-white opacity-75">
                            {language === 'es' ? 'Imprime o muestra este código QR' : 'Print or display this QR code'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <h5 className="card-title mb-3">Quick Actions</h5>
                    <div className="d-flex gap-3 flex-wrap">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setActiveTab('menu')}
                      >
                        {t.addNewItem}
                      </button>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setActiveTab('orders')}
                      >
                        View {t.orders}
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => setActiveTab('analytics')}
                      >
                        View {t.analytics}
                      </button>
                    </div>
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

            {menuItems.length === 0 ? (
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
                          <div key={item.id} className="col-lg-4 col-md-6">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                              {item.image_url && (
                                <div style={{ height: '200px', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
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
                        <div key={item.id} className="col-lg-4 col-md-6">
                          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                            {item.image_url && (
                              <div style={{ height: '200px', overflow: 'hidden', borderRadius: '15px 15px 0 0' }}>
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