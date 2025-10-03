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

export default function VendorDashboardModern() {
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'cashier', label: 'Cashier', icon: '💳' },
    { id: 'menu', label: 'Menu', icon: '🍽️' },
    { id: 'customize', label: 'Customize', icon: '🎨' },
    { id: 'hardware', label: 'Hardware', icon: '💰' },
    { id: 'qr', label: 'QR Code', icon: '📱' }
  ];

  const getCategoryDisplayName = (categoryValue) => {
    const category = menuCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(data.user);
        } else {
          navigate('/vendor-login');
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/vendor-login');
      } finally {
        setAuthLoading(false);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/vendor-login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
        category: newItem.category || null,
      },
    ]);

    if (error) {
      alert("Error creating item: " + error.message);
    } else {
      setNewItem({ name: "", description: "", price: "", category: "" });
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
      category: item.category || '',
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
        category: editedItem.category || null,
      })
      .eq("id", id);

    setEditingItemId(null);
    fetchMenuItems();
  };

  const getMenuUrl = () => {
    if (!vendorProfile?.slug) return "";
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
          category: item.category || null,
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
        category: item.category || null,
      }]);
      
      alert(`✅ Added "${item.name}" to your menu!`);
      fetchMenuItems();
    } catch (error) {
      alert("Error adding item: " + error.message);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <h4 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h4>
          <p className="text-gray-500">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {vendorProfile?.business_name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/vendor-login');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-1 p-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center border`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <AnalyticsDashboard user={user} vendorProfile={vendorProfile} />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrderManagement user={user} />
          )}

          {/* Cashier Tab */}
          {activeTab === 'cashier' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">💳</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cashier Orders</h2>
                <p className="text-gray-600">Create orders for customers paying at the counter</p>
              </div>
              <CashierOrder 
                user={user}
                onOrderCreated={() => {}}
              />
            </div>
          )}

          {/* Customize Tab */}
          {activeTab === 'customize' && (
            <BusinessCustomization 
              user={user} 
              vendorProfile={vendorProfile}
              onProfileUpdate={setVendorProfile}
            />
          )}

          {/* Hardware Tab */}
          {activeTab === 'hardware' && (
            <CashDrawerSettings />
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Menu Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>🍽️</span>
                      <span>Menu Management</span>
                    </h2>
                    <p className="text-gray-600 mt-1">Manage your food truck menu items</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button 
                      onClick={() => setShowFoodLibrary(true)}
                      className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>📚</span>
                      <span>Food Library</span>
                    </button>
                    <button 
                      onClick={() => {
                        document.getElementById('add-item-form').scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>➕</span>
                      <span>Add Custom Item</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Templates */}
              {menuItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Start Your Menu</h3>
                    <p className="text-gray-600">Choose a template to populate your menu instantly</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(cuisineTemplates).map(([name, type]) => (
                      <button
                        key={type}
                        onClick={() => populateMenuFromTemplate(type)}
                        className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center group"
                      >
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
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
                        <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
                        <p className="text-sm text-gray-500">{massiveFoodLibrary[type]?.length || 0} items</p>
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                      💡 You can always customize items after adding them to your menu
                    </p>
                  </div>
                </div>
              )}

              {/* Add Custom Item Form */}
              <div id="add-item-form" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <span>➕</span>
                  <span>Add Custom Menu Item</span>
                </h3>
                <form onSubmit={handleCreateItem} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="e.g. Carne Asada Tacos"
                        value={newItem.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="0.00"
                        value={newItem.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      value={newItem.category}
                      onChange={handleInputChange}
                    >
                      {menuCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      rows="3"
                      placeholder="Describe your delicious item..."
                      value={newItem.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-gray-500 mt-2">Upload a high-quality photo of your item</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding Item...</span>
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          <span>Add to Menu</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Menu Items */}
              {menuItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <span>📋</span>
                      <span>Current Menu Items</span>
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {menuItems.length} items
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <div key={item.id}>
                        {editingItemId === item.id ? (
                          <div className="p-4 border-2 border-blue-300 rounded-xl bg-blue-50">
                            <div className="space-y-3">
                              <input
                                type="text"
                                name="name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={editedItem.name}
                                onChange={handleEditChange}
                                placeholder="Item name"
                              />
                              <textarea
                                name="description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                value={editedItem.description}
                                onChange={handleEditChange}
                                placeholder="Description"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  name="price"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={editedItem.price}
                                  onChange={handleEditChange}
                                  placeholder="Price"
                                />
                                <select
                                  name="category"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={editedItem.category}
                                  onChange={handleEditChange}
                                >
                                  {menuCategories.map(category => (
                                    <option key={category.value} value={category.value}>
                                      {category.icon} {category.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                                >
                                  ✅ Save
                                </button>
                                <button
                                  onClick={() => setEditingItemId(null)}
                                  className="flex-1 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm font-medium"
                                >
                                  ❌ Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white">
                            <div className="flex space-x-4">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-400 text-2xl">🍽️</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</span>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    >
                                      🗑️
                                    </button>
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
              )}
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qr' && vendorProfile && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📱</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your QR Code Menu</h2>
                <p className="text-gray-600">Share this with your customers for instant ordering</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menu URL</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50"
                      value={getMenuUrl()}
                      readOnly
                    />
                    <button 
                      onClick={copyMenuUrl}
                      className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>📋</span>
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm mb-6">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getMenuUrl())}`}
                      alt="QR Code for menu"
                      className="w-64 h-64 rounded-xl"
                    />
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📸 Print & Display This QR Code</h3>
                    <p className="text-gray-600">
                      Customers scan → view menu → order → pay → pickup!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <div className="font-semibold text-gray-900">1. Scan</div>
                    </div>
                    <div className="p-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🛒</span>
                      </div>
                      <div className="font-semibold text-gray-900">2. Order</div>
                    </div>
                    <div className="p-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="font-semibold text-gray-900">3. Pay</div>
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