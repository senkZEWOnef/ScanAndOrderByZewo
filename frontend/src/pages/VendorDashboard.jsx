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
      console.log('User authenticated:', user.id);
      fetchVendorProfile();
      fetchMenuItems();
    } else {
      console.log('No authenticated user');
    }
  }, [user]);

  const fetchVendorProfile = async () => {
    console.log('Fetching vendor profile for user:', user.id);
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (error) {
      console.error('Error fetching vendor profile:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // If no profile exists, we might need to create one
      if (error.code === 'PGRST116') {
        console.log('No vendor profile found - creating default profile');
        await createDefaultVendorProfile();
      }
    } else {
      console.log('Vendor profile loaded:', data);
      setVendorProfile(data);
    }
  };

  const createDefaultVendorProfile = async () => {
    const { data, error } = await supabase
      .from("vendor_profiles")
      .insert([{
        id: user.id,
        business_name: 'My Food Truck',
        description: 'Welcome to my food truck!',
        email: user.email,
        is_active: true,
        delivery_fee: 0,
        minimum_order: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor profile:', error);
    } else {
      console.log('Default vendor profile created:', data);
      setVendorProfile(data);
    }
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching menu items:', error);
    } else {
      setMenuItems(data);
    }
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
    <div className="tailwind-dashboard min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Premium Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {vendorProfile?.business_name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-emerald-700">Live</span>
              </div>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/vendor-login');
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Premium Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-8 p-2">
          <nav className="flex space-x-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                } flex items-center space-x-3 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 flex-1 justify-center transform hover:scale-105`}
              >
                <span className="text-xl">{tab.icon}</span>
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
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl shadow-2xl border border-emerald-100 p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/25">
                  <span className="text-white text-3xl">💳</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
                  Cashier Orders
                </h2>
                <p className="text-gray-600 text-lg font-medium">Create orders for customers paying at the counter</p>
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
            <div className="space-y-8">
              {/* Premium Menu Header */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl shadow-2xl border border-purple-100 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <span className="text-3xl">🍽️</span>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          Menu Management
                        </h2>
                        <p className="text-gray-600 font-medium">Create and manage your delicious offerings</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button 
                      onClick={() => setShowFoodLibrary(true)}
                      className="group px-6 py-3 bg-white text-violet-600 border-2 border-violet-200 rounded-2xl hover:bg-violet-50 hover:border-violet-300 transition-all duration-300 flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                      <span>Food Library</span>
                    </button>
                    <button 
                      onClick={() => {
                        document.getElementById('add-item-form').scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
                      <span>Add Custom Item</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Premium Quick Templates */}
              {menuItems.length === 0 && (
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
                  <div className="text-center mb-12">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/25">
                        <span className="text-4xl">🎯</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm">✨</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                      Quick Start Your Menu
                    </h3>
                    <p className="text-gray-600 text-lg font-medium">Choose a cuisine template to populate your menu instantly</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Object.entries(cuisineTemplates).map(([name, type]) => (
                      <button
                        key={type}
                        onClick={() => populateMenuFromTemplate(type)}
                        className="group p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 text-center transform hover:-translate-y-2"
                      >
                        <div className="text-4xl mb-4 group-hover:scale-125 transition-all duration-300 filter group-hover:drop-shadow-lg">
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
                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">{name}</h4>
                        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold">
                          <span>{massiveFoodLibrary[type]?.length || 0}</span>
                          <span>items</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-center mt-10">
                    <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <span className="text-2xl">💡</span>
                      <p className="text-blue-700 font-semibold">
                        You can always customize items after adding them to your menu
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Add Custom Item Form */}
              <div id="add-item-form" className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Add Custom Menu Item
                    </h3>
                    <p className="text-gray-600 font-medium">Create your signature dish</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateItem} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Item Name</label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                        placeholder="e.g. Carne Asada Tacos"
                        value={newItem.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Price</label>
                      <div className="relative">
                        <span className="absolute left-6 top-4 text-gray-500 font-bold text-lg">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          className="w-full pl-12 pr-6 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                          placeholder="0.00"
                          value={newItem.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                    <select
                      name="category"
                      className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 font-medium"
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

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400 resize-none"
                      rows="4"
                      placeholder="Describe your delicious item in mouth-watering detail..."
                      value={newItem.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Photo (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-900 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-xl">📸</span>
                      <p className="text-sm text-gray-600 font-medium">Upload a high-quality photo to make customers hungry!</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding Item...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl group-hover:scale-110 transition-transform">🚀</span>
                          <span>Add to Menu</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Premium Current Menu Items */}
              {menuItems.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Current Menu Items
                        </h3>
                        <p className="text-gray-600 font-medium">Manage your delicious offerings</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <span className="text-xl">🎯</span>
                      <span className="text-blue-700 font-bold text-lg">{menuItems.length} items</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {menuItems.map((item) => (
                      <div key={item.id}>
                        {editingItemId === item.id ? (
                          <div className="p-6 border-2 border-blue-300 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
                            <div className="space-y-4">
                              <input
                                type="text"
                                name="name"
                                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium"
                                value={editedItem.name}
                                onChange={handleEditChange}
                                placeholder="Item name"
                              />
                              <textarea
                                name="description"
                                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium resize-none"
                                rows="3"
                                value={editedItem.description}
                                onChange={handleEditChange}
                                placeholder="Description"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                  <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium"
                                    value={editedItem.price}
                                    onChange={handleEditChange}
                                    placeholder="0.00"
                                  />
                                </div>
                                <select
                                  name="category"
                                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium"
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
                              <div className="flex space-x-3 pt-2">
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                  ✅ Save Changes
                                </button>
                                <button
                                  onClick={() => setEditingItemId(null)}
                                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                  ❌ Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="group p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex space-x-5">
                              {item.image_url ? (
                                <div className="relative">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-2xl flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                  />
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <span className="text-gray-400 text-3xl">🍽️</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-violet-600 transition-colors">{item.name}</h4>
                                <p className="text-gray-600 text-sm mt-2 line-clamp-2 font-medium">{item.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                      ${item.price.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
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

          {/* Premium QR Code Tab */}
          {activeTab === 'qr' && vendorProfile && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="text-center mb-12">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25">
                    <span className="text-white text-4xl">📱</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Your QR Code Menu
                </h2>
                <p className="text-gray-600 text-xl font-medium">Share this with your customers for instant ordering</p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                  <label className="block text-lg font-bold text-gray-700 mb-4">Menu URL</label>
                  <div className="flex rounded-2xl overflow-hidden shadow-xl">
                    <input
                      type="text"
                      className="flex-1 px-6 py-4 bg-gray-50 border-2 border-gray-200 text-gray-700 font-mono text-sm"
                      value={getMenuUrl()}
                      readOnly
                    />
                    <button 
                      onClick={copyMenuUrl}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-3 font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      <span className="text-xl">📋</span>
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-block p-8 bg-gradient-to-br from-white to-gray-50 border-4 border-purple-200 rounded-3xl shadow-2xl mb-10 transform hover:scale-105 transition-transform duration-300">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getMenuUrl())}`}
                      alt="QR Code for menu"
                      className="w-72 h-72 rounded-2xl shadow-lg"
                    />
                  </div>
                  
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                      📸 Print & Display This QR Code
                    </h3>
                    <p className="text-gray-600 text-lg font-medium">
                      Customers scan → view menu → order → pay → pickup!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-8">
                    <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-3xl">🔍</span>
                      </div>
                      <div className="font-bold text-blue-700 text-xl">1. Scan</div>
                      <p className="text-blue-600 text-sm mt-2">Quick camera scan</p>
                    </div>
                    <div className="group p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-2">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-3xl">🛒</span>
                      </div>
                      <div className="font-bold text-emerald-700 text-xl">2. Order</div>
                      <p className="text-emerald-600 text-sm mt-2">Browse & select items</p>
                    </div>
                    <div className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-2">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                        <span className="text-3xl">💳</span>
                      </div>
                      <div className="font-bold text-purple-700 text-xl">3. Pay</div>
                      <p className="text-purple-600 text-sm mt-2">Secure payment</p>
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