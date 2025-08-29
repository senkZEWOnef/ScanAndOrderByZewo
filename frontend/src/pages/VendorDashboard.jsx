import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import OrderManagement from "../components/OrderManagement";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import BusinessCustomization from "../components/BusinessCustomization";
import FoodLibraryModal from "../components/FoodLibraryModal";
import { massiveFoodLibrary, cuisineTemplates } from "../data/massiveFoodLibrary";

export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFoodLibrary, setShowFoodLibrary] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchVendorProfile();
      fetchMenuItems();
    }
  }, [user]);

  const fetchVendorProfile = async () => {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (!error) setVendorProfile(data);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setMenuItems(data);
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Image upload failed");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("menu_items").insert([
      {
        vendor_id: user.id,
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert("Error creating item: " + error.message);
    } else {
      setNewItem({ name: "", description: "", price: "" });
      setImageFile(null);
      fetchMenuItems();
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    await supabase.from("menu_items").delete().eq("id", id);
    fetchMenuItems();
  };

  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setEditedItem({
      name: item.name,
      description: item.description,
      price: item.price,
    });
  };

  const handleEditChange = (e) => {
    setEditedItem({ ...editedItem, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    await supabase
      .from("menu_items")
      .update({
        name: editedItem.name,
        description: editedItem.description,
        price: parseFloat(editedItem.price),
      })
      .eq("id", id);

    setEditingItemId(null);
    fetchMenuItems();
  };

  const getMenuUrl = () => {
    if (!vendorProfile?.slug) return "";
    // For development, use network IP so mobile devices can access
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://192.168.0.101:${window.location.port}/menu/${vendorProfile.slug}`;
    }
    return `${window.location.origin}/menu/${vendorProfile.slug}`;
  };

  const copyMenuUrl = () => {
    navigator.clipboard.writeText(getMenuUrl());
    alert("Menu URL copied to clipboard!");
  };

  const populateMenuFromTemplate = async (cuisineType) => {
    if (!window.confirm(`This will add ${massiveFoodLibrary[cuisineType].length} items to your menu. Continue?`)) {
      return;
    }

    setIsPopulating(true);
    const items = massiveFoodLibrary[cuisineType];
    
    try {
      for (const item of items) {
        await supabase.from("menu_items").insert([{
          vendor_id: user.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
        }]);
      }
      
      alert(`✅ Successfully added ${items.length} items to your menu!`);
      fetchMenuItems();
      setShowFoodLibrary(false);
    } catch (error) {
      alert("Error populating menu: " + error.message);
    } finally {
      setIsPopulating(false);
    }
  };

  const addSingleFoodItem = async (item) => {
    try {
      await supabase.from("menu_items").insert([{
        vendor_id: user.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
      }]);
      
      alert(`✅ Added "${item.name}" to your menu!`);
      fetchMenuItems();
    } catch (error) {
      alert("Error adding item: " + error.message);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Modern Header */}
      <div className="bg-white shadow-sm">
        <div className="container-fluid px-4 py-4">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center me-3"
                     style={{ width: '50px', height: '50px' }}>
                  <span className="text-white fs-4">🚀</span>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold text-dark">{vendorProfile?.business_name || 'Dashboard'}</h3>
                  <p className="mb-0 text-muted">Welcome back, {user?.email}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-end">
              <div className="d-flex align-items-center justify-content-end gap-3">
                <div className="text-end">
                  <div className="small text-muted">Status</div>
                  <span className="badge bg-success">🟢 Online</span>
                </div>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Modern Tab Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-0">
                <div className="nav nav-pills nav-fill" style={{ borderRadius: '16px' }}>
                  <button 
                    className={`nav-link border-0 py-3 ${activeTab === 'dashboard' ? 'active' : ''}`}
                    style={{ 
                      borderRadius: '16px 0 0 16px',
                      background: activeTab === 'dashboard' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'transparent',
                      color: activeTab === 'dashboard' ? 'white' : '#6c757d'
                    }}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <span className="fs-4 mb-1">📊</span>
                      <span className="fw-semibold small">Dashboard</span>
                    </div>
                  </button>
                  <button 
                    className={`nav-link border-0 py-3 ${activeTab === 'orders' ? 'active' : ''}`}
                    style={{ 
                      background: activeTab === 'orders' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'transparent',
                      color: activeTab === 'orders' ? 'white' : '#6c757d'
                    }}
                    onClick={() => setActiveTab('orders')}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <span className="fs-4 mb-1">📋</span>
                      <span className="fw-semibold small">Orders</span>
                    </div>
                  </button>
                  <button 
                    className={`nav-link border-0 py-3 ${activeTab === 'menu' ? 'active' : ''}`}
                    style={{ 
                      background: activeTab === 'menu' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'transparent',
                      color: activeTab === 'menu' ? 'white' : '#6c757d'
                    }}
                    onClick={() => setActiveTab('menu')}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <span className="fs-4 mb-1">🍽️</span>
                      <span className="fw-semibold small">Menu</span>
                    </div>
                  </button>
                  <button 
                    className={`nav-link border-0 py-3 ${activeTab === 'customize' ? 'active' : ''}`}
                    style={{ 
                      background: activeTab === 'customize' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'transparent',
                      color: activeTab === 'customize' ? 'white' : '#6c757d'
                    }}
                    onClick={() => setActiveTab('customize')}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <span className="fs-4 mb-1">🎨</span>
                      <span className="fw-semibold small">Customize</span>
                    </div>
                  </button>
                  <button 
                    className={`nav-link border-0 py-3 ${activeTab === 'qr' ? 'active' : ''}`}
                    style={{ 
                      borderRadius: '0 16px 16px 0',
                      background: activeTab === 'qr' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'transparent',
                      color: activeTab === 'qr' ? 'white' : '#6c757d'
                    }}
                    onClick={() => setActiveTab('qr')}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <span className="fs-4 mb-1">📱</span>
                      <span className="fw-semibold small">QR Code</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard user={user} vendorProfile={vendorProfile} />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderManagement user={user} />
        )}

        {/* Customize Tab */}
        {activeTab === 'customize' && (
          <BusinessCustomization 
            user={user} 
            vendorProfile={vendorProfile}
            onProfileUpdate={setVendorProfile}
          />
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="row">
            <div className="col-12">
              {/* Menu Header with Actions */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-lg-6">
                      <h4 className="mb-0 fw-bold text-dark">🍽️ Menu Management</h4>
                      <p className="mb-0 text-muted">Manage your food truck menu items</p>
                    </div>
                    <div className="col-lg-6 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => setShowFoodLibrary(true)}
                        >
                          📚 Food Library
                        </button>
                        <button 
                          className="btn btn-primary"
                          style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}
                          onClick={() => {
                            document.getElementById('add-item-form').scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          ➕ Add Custom Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Templates */}
              {menuItems.length === 0 && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4">
                    <div className="text-center mb-4">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                           style={{ width: '80px', height: '80px' }}>
                        <span className="fs-1">🎯</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-2">Quick Start Your Menu</h5>
                      <p className="text-muted">Choose a template to populate your menu instantly</p>
                    </div>
                    
                    <div className="row g-3">
                      {Object.entries(cuisineTemplates).map(([name, type]) => (
                        <div key={type} className="col-lg-3 col-md-4 col-sm-6">
                          <div className="card border-0 shadow-sm h-100" 
                               style={{ borderRadius: '12px', cursor: 'pointer' }}
                               onClick={() => populateMenuFromTemplate(type)}>
                            <div className="card-body text-center p-4">
                              <div className="fs-1 mb-3">
                                {type === 'mexican' && '🌮'}
                                {type === 'american' && '🍔'}
                                {type === 'italian' && '🍝'}
                                {type === 'asian' && '🍜'}
                                {type === 'jamaican' && '🏝️'}
                                {type === 'haitian' && '🇭🇹'}
                                {type === 'puerto_rican' && '🇵🇷'}
                                {type === 'indian' && '🍛'}
                                {type === 'greek' && '🫒'}
                                {type === 'middle_eastern' && '🥙'}
                                {type === 'soul_food' && '🍗'}
                                {type === 'desserts' && '🍰'}
                              </div>
                              <h6 className="fw-bold mb-2">{name}</h6>
                              <small className="text-muted">{massiveFoodLibrary[type]?.length || 0} items</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-4">
                      <small className="text-muted">
                        💡 You can always customize items after adding them to your menu
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Custom Item Form */}
              <div id="add-item-form" className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-4">➕ Add Custom Menu Item</h5>
                  <form onSubmit={handleCreateItem}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Item Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control form-control-lg"
                          style={{ borderRadius: '12px' }}
                          placeholder="e.g. Carne Asada Tacos"
                          value={newItem.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          className="form-control form-control-lg"
                          style={{ borderRadius: '12px' }}
                          placeholder="0.00"
                          value={newItem.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea
                          name="description"
                          className="form-control"
                          style={{ borderRadius: '12px' }}
                          rows="3"
                          placeholder="Describe your delicious item..."
                          value={newItem.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Photo (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-lg"
                          style={{ borderRadius: '12px' }}
                          onChange={handleImageChange}
                        />
                        <div className="form-text">
                          <small className="text-muted">Upload a high-quality photo of your item</small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-end mt-4">
                      <button 
                        className="btn btn-primary btn-lg px-4"
                        style={{ borderRadius: '12px', background: 'linear-gradient(45deg, #28a745, #20c997)' }}
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Adding Item...
                          </>
                        ) : (
                          "✅ Add to Menu"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Current Menu Items */}
              {menuItems.length > 0 && (
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold text-dark mb-0">📋 Current Menu Items</h5>
                      <span className="badge bg-primary">{menuItems.length} items</span>
                    </div>
                    
                    <div className="row g-3">
                      {menuItems.map((item) => (
                        <div key={item.id} className="col-lg-6">
                          {editingItemId === item.id ? (
                            <div className="card border-2 border-primary" style={{ borderRadius: '12px' }}>
                              <div className="card-body p-3">
                                <div className="mb-3">
                                  <input
                                    type="text"
                                    name="name"
                                    className="form-control mb-2"
                                    style={{ borderRadius: '8px' }}
                                    value={editedItem.name}
                                    onChange={handleEditChange}
                                    placeholder="Item name"
                                  />
                                  <textarea
                                    name="description"
                                    className="form-control mb-2"
                                    style={{ borderRadius: '8px' }}
                                    rows="2"
                                    value={editedItem.description}
                                    onChange={handleEditChange}
                                    placeholder="Description"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    className="form-control"
                                    style={{ borderRadius: '8px' }}
                                    value={editedItem.price}
                                    onChange={handleEditChange}
                                    placeholder="Price"
                                  />
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-success btn-sm flex-fill"
                                    onClick={() => handleSaveEdit(item.id)}
                                  >
                                    ✅ Save
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm flex-fill"
                                    onClick={() => setEditingItemId(null)}
                                  >
                                    ❌ Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="card border-0 shadow-sm h-100" 
                                 style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                              <div className="card-body p-3">
                                <div className="d-flex align-items-start gap-3">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="rounded-3"
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        flexShrink: 0
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                                      style={{ width: "80px", height: "80px", flexShrink: 0 }}
                                    >
                                      <span className="text-muted fs-4">🍽️</span>
                                    </div>
                                  )}
                                  <div className="flex-grow-1 min-w-0">
                                    <h6 className="fw-bold mb-1">{item.name}</h6>
                                    <p className="text-muted small mb-2 lh-sm">{item.description}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className="fs-5 fw-bold text-success">${item.price.toFixed(2)}</span>
                                      <div className="d-flex gap-1">
                                        <button
                                          className="btn btn-outline-primary btn-sm"
                                          onClick={() => handleEdit(item)}
                                          style={{ borderRadius: '8px' }}
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          className="btn btn-outline-danger btn-sm"
                                          onClick={() => handleDelete(item.id)}
                                          style={{ borderRadius: '8px' }}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && vendorProfile && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-2">📱 Your QR Code Menu</h4>
                <p className="text-muted">Share this with your customers for instant ordering</p>
              </div>
              
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Menu URL</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        style={{ borderRadius: '12px 0 0 12px' }}
                        value={getMenuUrl()}
                        readOnly
                      />
                      <button 
                        className="btn btn-primary"
                        style={{ borderRadius: '0 12px 12px 0' }}
                        onClick={copyMenuUrl}
                      >
                        📋 Copy URL
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-4 shadow-sm d-inline-block mb-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getMenuUrl())}`}
                        alt="QR Code for menu"
                        className="rounded-3"
                        style={{ width: '250px', height: '250px' }}
                      />
                    </div>
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2">📸 Print & Display This QR Code</h6>
                      <p className="text-muted small">
                        Customers scan → view menu → order → pay → pickup!
                      </p>
                    </div>
                    
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="p-3">
                          <div className="fs-1 mb-2">🔍</div>
                          <div className="small fw-semibold">1. Scan</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-3">
                          <div className="fs-1 mb-2">🛒</div>
                          <div className="small fw-semibold">2. Order</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-3">
                          <div className="fs-1 mb-2">💳</div>
                          <div className="small fw-semibold">3. Pay</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Food Library Modal */}
      <FoodLibraryModal
        isOpen={showFoodLibrary}
        onClose={() => setShowFoodLibrary(false)}
        onAddItem={addSingleFoodItem}
        onPopulateMenu={populateMenuFromTemplate}
      />
    </div>
  );
}
