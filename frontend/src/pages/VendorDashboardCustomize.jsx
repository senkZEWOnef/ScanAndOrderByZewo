import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function VendorDashboardCustomize() {
  const [vendor, setVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState({
    mains: 'Main Dishes',
    appetizers: 'Appetizers & Starters', 
    sides: 'Sides & Extras',
    drinks: 'Beverages',
    desserts: 'Desserts & Sweets',
    other: 'Specialties'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Form states
  const [businessInfo, setBusinessInfo] = useState({
    business_name: '',
    description: '',
    cuisine_type: '',
    phone: '',
    address: '',
    background_color: '#f8f9fa',
    header_color: '#ffffff'
  });
  
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'mains',
    is_available: true
  });
  
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      console.log('Fetching vendor data...');
      
      // For demo purposes, get the first vendor
      // In real app, this would be based on auth.user()
      const { data: vendors, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (vendorError) {
        console.error('Error fetching vendors:', vendorError);
        return;
      }
      
      console.log('Fetched vendors:', vendors);
      
      if (vendors && vendors.length > 0) {
        const vendorData = vendors[0];
        console.log('Selected vendor data:', {
          id: vendorData.id,
          business_name: vendorData.business_name,
          logo_url: vendorData.logo_url,
          banner_url: vendorData.banner_url
        });
        
        setVendor(vendorData);
        setBusinessInfo({
          business_name: vendorData.business_name || '',
          description: vendorData.description || '',
          cuisine_type: vendorData.cuisine_type || '',
          phone: vendorData.phone || '',
          address: vendorData.address || '',
          background_color: vendorData.background_color || '#f8f9fa',
          header_color: vendorData.header_color || '#ffffff'
        });
        
        // Get menu items
        const { data: menuData } = await supabase
          .from('menu_items')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .order('created_at', { ascending: false });
        
        setMenuItems(menuData || []);
      } else {
        console.log('No vendors found');
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    }
    setLoading(false);
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !vendor) {
      alert('No file selected or vendor not found');
      return null;
    }
    
    console.log('Starting upload:', { type, fileName: file.name, vendorId: vendor.id });
    setSaving(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendor.id}_${type}_${Date.now()}.${fileExt}`;
      const bucketName = type === 'logo' ? 'vendor-logos' : 'vendor-banners';
      
      console.log('Upload details:', { fileName, bucketName, fileSize: file.size });
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Error uploading ${type}: ${uploadError.message}\n\nBucket: ${bucketName}\nFile: ${fileName}`);
        return null;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;
      console.log('Generated URL:', imageUrl);
      
      // Update vendor profile in database
      const updateField = type === 'logo' ? 'logo_url' : 'banner_url';
      console.log('Updating database:', { updateField, imageUrl, vendorId: vendor.id });
      
      const { data: updateData, error: updateError } = await supabase
        .from('vendor_profiles')
        .update({ [updateField]: imageUrl })
        .eq('id', vendor.id)
        .select('id, business_name, logo_url, banner_url');

      if (updateError) {
        console.error('Database update error:', updateError);
        alert(`Error updating database: ${updateError.message}`);
        return null;
      }

      console.log('Database updated successfully:', updateData);
      
      // Verify the update worked
      if (updateData && updateData[0]) {
        const updatedVendor = updateData[0];
        console.log('Verified update - New', updateField, ':', updatedVendor[updateField]);
      }

      // Update local state immediately
      setVendor(prev => ({ ...prev, [updateField]: imageUrl }));
      
      alert(`${type === 'logo' ? 'Profile picture' : 'Banner'} updated successfully!\n\nURL: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading ${type}: ${error.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessInfoUpdate = async () => {
    if (!vendor) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('vendor_profiles')
        .update(businessInfo)
        .eq('id', vendor.id);

      if (error) {
        alert('Error updating business info: ' + error.message);
      } else {
        setVendor(prev => ({ ...prev, ...businessInfo }));
        alert('Business information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating business info:', error);
      alert('Error updating business information');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMenuItem = async () => {
    if (!vendor || !newMenuItem.name || !newMenuItem.price) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          ...newMenuItem,
          vendor_id: vendor.id,
          price: parseFloat(newMenuItem.price)
        }])
        .select()
        .single();

      if (error) {
        alert('Error adding menu item: ' + error.message);
      } else {
        setMenuItems(prev => [data, ...prev]);
        setNewMenuItem({
          name: '',
          description: '',
          price: '',
          category: 'mains',
          is_available: true
        });
        setShowAddModal(false);
        alert('Menu item added successfully!');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMenuItem = async (item) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          category: item.category,
          is_available: item.is_available
        })
        .eq('id', item.id);

      if (error) {
        alert('Error updating menu item: ' + error.message);
      } else {
        setMenuItems(prev => prev.map(mi => mi.id === item.id ? item : mi));
        setEditingItem(null);
        alert('Menu item updated successfully!');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Error updating menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        alert('Error deleting menu item: ' + error.message);
      } else {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
        alert('Menu item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>No Vendor Found</h4>
          <p>Please create a vendor profile first or check your authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 fw-bold mb-2">Restaurant Dashboard</h1>
          <p className="text-muted">Customize your restaurant page and manage your menu</p>
          {vendor && (
            <div className="small text-muted">
              Vendor ID: {vendor.id} | 
              Logo: {vendor.logo_url ? '✅' : '❌'} | 
              Banner: {vendor.banner_url ? '✅' : '❌'}
            </div>
          )}
        </div>
        <div className="col-md-4 text-md-end">
          <div className="btn-group">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => {
                setLoading(true);
                fetchVendorData();
              }}
              disabled={loading}
            >
              🔄 Refresh Data
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? '📝 Edit Mode' : '👀 Preview Mode'}
            </button>
            <a 
              href={`/menu/${vendor?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              🔗 View Live Page
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill bg-light rounded-3 p-1">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                🎨 Appearance
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                🍽️ Menu Management
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                📁 Categories
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="row">
          <div className="col-lg-8">
            {/* Current Preview */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">📱 Current Page Preview</h5>
              </div>
              <div className="card-body p-0">
                {/* Mini Preview */}
                <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                  {/* Banner */}
                  <div style={{ height: '120px', position: 'relative' }}>
                    {vendor.banner_url ? (
                      <img 
                        src={vendor.banner_url}
                        alt="Banner"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="bg-gradient text-white d-flex align-items-center justify-content-center"
                        style={{ 
                          height: '100%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        <span>🍽️ Add Banner Image</span>
                      </div>
                    )}
                    <div 
                      className="position-absolute"
                      style={{ 
                        bottom: '-30px', 
                        left: '20px',
                        width: '60px',
                        height: '60px'
                      }}
                    >
                      {vendor.logo_url ? (
                        <img 
                          src={vendor.logo_url}
                          alt="Logo"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '12px',
                            border: '3px solid white',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }}
                        />
                      ) : (
                        <div 
                          className="bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            borderRadius: '12px',
                            border: '3px solid white',
                            fontSize: '1.5rem'
                          }}
                        >
                          🍽️
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Restaurant Info */}
                  <div className="p-3" style={{ paddingTop: '40px' }}>
                    <h5 className="fw-bold mb-1">{vendor.business_name}</h5>
                    <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                      {vendor.description || 'Add a description...'}
                    </p>
                    <div className="d-flex gap-2">
                      <span className="badge bg-success">⚡ 15-20 min</span>
                      <span className="badge bg-info">🚀 QR Ordering</span>
                      {vendor.cuisine_type && (
                        <span className="badge bg-secondary">
                          {vendor.cuisine_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Upload Controls */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">🖼️ Images</h5>
              </div>
              <div className="card-body">
                {/* Banner Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Banner Image</label>
                  <p className="text-muted small mb-2">Recommended: 1200x300px, JPG/PNG</p>
                  <input 
                    type="file" 
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0], 'banner');
                      }
                    }}
                    disabled={saving}
                  />
                </div>
                
                {/* Logo Upload */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Profile Picture/Logo</label>
                  <p className="text-muted small mb-2">Recommended: 200x200px, JPG/PNG</p>
                  <input 
                    type="file" 
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0], 'logo');
                      }
                    }}
                    disabled={saving}
                  />
                </div>
                
                {/* Background Color */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Background Color</label>
                  <p className="text-muted small mb-2">Choose the background color for your menu page</p>
                  <div className="d-flex align-items-center gap-3">
                    <input 
                      type="color" 
                      className="form-control form-control-color"
                      value={businessInfo.background_color}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, background_color: e.target.value }))}
                      style={{ width: '60px', height: '40px' }}
                    />
                    <input 
                      type="text" 
                      className="form-control"
                      value={businessInfo.background_color}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, background_color: e.target.value }))}
                      placeholder="#f8f9fa"
                      style={{ maxWidth: '120px' }}
                    />
                    <div className="d-flex gap-1">
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, background_color: '#ffffff' }))}
                        title="White"
                      >
                        ⚪
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, background_color: '#f8f9fa' }))}
                        title="Light Gray"
                      >
                        ⚫
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, background_color: '#e3f2fd' }))}
                        title="Light Blue"
                      >
                        🔵
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, background_color: '#f3e5f5' }))}
                        title="Light Purple"
                      >
                        🟣
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Header Color */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Header Card Color</label>
                  <p className="text-muted small mb-2">Choose the color for the header card behind your profile picture</p>
                  <div className="d-flex align-items-center gap-3">
                    <input 
                      type="color" 
                      className="form-control form-control-color"
                      value={businessInfo.header_color}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, header_color: e.target.value }))}
                      style={{ width: '60px', height: '40px' }}
                    />
                    <input 
                      type="text" 
                      className="form-control"
                      value={businessInfo.header_color}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, header_color: e.target.value }))}
                      placeholder="#ffffff"
                      style={{ maxWidth: '120px' }}
                    />
                    <div className="d-flex gap-1">
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, header_color: '#ffffff' }))}
                        title="White"
                      >
                        ⚪
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, header_color: '#f8f9fa' }))}
                        title="Light Gray"
                      >
                        ⚫
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, header_color: '#fff3e0' }))}
                        title="Light Orange"
                      >
                        🟠
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setBusinessInfo(prev => ({ ...prev, header_color: '#e8f5e8' }))}
                        title="Light Green"
                      >
                        🟢
                      </button>
                    </div>
                  </div>
                </div>
                
                {saving && (
                  <div className="text-center">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                    <span className="ms-2">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Business Info */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">ℹ️ Business Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Business Name</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={businessInfo.business_name}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, business_name: e.target.value }))}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    value={businessInfo.description}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your restaurant..."
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Cuisine Type</label>
                  <select 
                    className="form-control"
                    value={businessInfo.cuisine_type}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, cuisine_type: e.target.value }))}
                  >
                    <option value="">Select cuisine type</option>
                    <option value="american">American</option>
                    <option value="mexican">Mexican</option>
                    <option value="italian">Italian</option>
                    <option value="asian">Asian</option>
                    <option value="jamaican">Jamaican</option>
                    <option value="haitian">Haitian</option>
                    <option value="puerto_rican">Puerto Rican</option>
                    <option value="indian">Indian</option>
                    <option value="greek">Greek</option>
                    <option value="middle_eastern">Middle Eastern</option>
                    <option value="soul_food">Soul Food</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input 
                    type="tel"
                    className="form-control"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <button 
                  className="btn btn-primary w-100"
                  onClick={handleBusinessInfoUpdate}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Information'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Menu Items ({menuItems.length})</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                ➕ Add New Item
              </button>
            </div>
            
            {menuItems.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <span style={{ fontSize: '4rem' }}>🍽️</span>
                </div>
                <h4>No Menu Items Yet</h4>
                <p className="text-muted">Add your first menu item to get started</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {menuItems.map(item => (
                  <div key={item.id} className="col-lg-6 col-xl-4">
                    <div className="card h-100">
                      <div className="card-body">
                        {editingItem?.id === item.id ? (
                          // Edit Mode
                          <div>
                            <div className="mb-3">
                              <input 
                                type="text"
                                className="form-control fw-bold"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div className="mb-3">
                              <textarea 
                                className="form-control"
                                rows="3"
                                value={editingItem.description}
                                onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <input 
                                  type="number"
                                  className="form-control"
                                  step="0.01"
                                  value={editingItem.price}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                                />
                              </div>
                              <div className="col-6">
                                <select 
                                  className="form-control"
                                  value={editingItem.category}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                                >
                                  <option value="mains">Main Dishes</option>
                                  <option value="appetizers">Appetizers</option>
                                  <option value="sides">Sides</option>
                                  <option value="drinks">Beverages</option>
                                  <option value="desserts">Desserts</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="form-check">
                                <input 
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={editingItem.is_available}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, is_available: e.target.checked }))}
                                />
                                <label className="form-check-label">Available</label>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleUpdateMenuItem(editingItem)}
                                disabled={saving}
                              >
                                Save
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingItem(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title mb-0">{item.name}</h5>
                              <div className="dropdown">
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  data-bs-toggle="dropdown"
                                >
                                  ⋮
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => setEditingItem({...item, price: item.price.toString()})}
                                    >
                                      ✏️ Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger"
                                      onClick={() => handleDeleteMenuItem(item.id)}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            <p className="card-text text-muted mb-3">{item.description}</p>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="fw-bold text-success h5">${item.price}</span>
                                <div>
                                  <span className="badge bg-light text-dark me-2">{item.category}</span>
                                  <span className={`badge ${item.is_available ? 'bg-success' : 'bg-danger'}`}>
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">📁 Customize Category Names</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  Customize how your menu categories appear to customers. These names will be shown in the filters and section headers.
                </p>
                
                {Object.entries(categories).map(([key, value]) => (
                  <div key={key} className="mb-3">
                    <label className="form-label text-capitalize fw-semibold">{key}</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={value}
                      onChange={(e) => setCategories(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Enter name for ${key} category`}
                    />
                  </div>
                ))}
                
                <button className="btn btn-primary">
                  Save Category Names
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">👀 Category Preview</h6>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">How categories will appear:</p>
                {Object.entries(categories).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="badge bg-primary me-2">
                      {key === 'mains' && '🍔'}
                      {key === 'appetizers' && '🥗'}
                      {key === 'sides' && '🍟'}
                      {key === 'drinks' && '🥤'}
                      {key === 'desserts' && '🍰'}
                      {key === 'other' && '🍽️'}
                    </span>
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">⚙️ Restaurant Settings</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>QR Code & Links</h6>
                    <div className="mb-3">
                      <label className="form-label">Your Menu URL</label>
                      <div className="input-group">
                        <input 
                          type="text"
                          className="form-control"
                          value={`${window.location.origin}/menu/${vendor?.slug || 'not-set'}`}
                          readOnly
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/menu/${vendor?.slug}`);
                            alert('URL copied to clipboard!');
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="form-text">Share this URL or generate a QR code pointing to it</div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6>Restaurant Status</h6>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input"
                        type="checkbox"
                        checked={vendor?.is_active || false}
                        onChange={(e) => {
                          // Update vendor status
                          setVendor(prev => ({ ...prev, is_active: e.target.checked }));
                        }}
                      />
                      <label className="form-check-label">
                        Restaurant is currently accepting orders
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Debug Panel */}
            <div className="card mt-4">
              <div className="card-header">
                <h6 className="mb-0">🐛 Debug Info</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Current Vendor Data:</strong>
                  <pre className="bg-light p-2 mt-2 small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {vendor ? JSON.stringify({
                      id: vendor.id,
                      business_name: vendor.business_name,
                      logo_url: vendor.logo_url,
                      banner_url: vendor.banner_url,
                      slug: vendor.slug
                    }, null, 2) : 'No vendor data'}
                  </pre>
                </div>
                
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={async () => {
                    const { data, error } = await supabase
                      .from('vendor_profiles')
                      .select('id, business_name, logo_url, banner_url, slug')
                      .order('created_at', { ascending: false });
                    
                    console.log('All vendors in database:', data);
                    alert(`Found ${data?.length || 0} vendors. Check console for details.`);
                  }}
                >
                  🔍 Check All Vendors in DB
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">📊 Quick Stats</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="h4 mb-0">{menuItems.length}</div>
                    <small className="text-muted">Menu Items</small>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="h4 mb-0">{menuItems.filter(item => item.is_available).length}</div>
                    <small className="text-muted">Available</small>
                  </div>
                  <div className="col-6">
                    <div className="h4 mb-0">
                      {Object.keys(categories).length}
                    </div>
                    <small className="text-muted">Categories</small>
                  </div>
                  <div className="col-6">
                    <div className="h4 mb-0 text-success">
                      {vendor?.is_active ? 'Open' : 'Closed'}
                    </div>
                    <small className="text-muted">Status</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">➕ Add New Menu Item</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Item Name *</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={newMenuItem.name}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Cheeseburger Deluxe"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Price *</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input 
                          type="number"
                          className="form-control"
                          step="0.01"
                          value={newMenuItem.price}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="9.99"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select 
                        className="form-control"
                        value={newMenuItem.category}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="mains">Main Dishes</option>
                        <option value="appetizers">Appetizers</option>
                        <option value="sides">Sides</option>
                        <option value="drinks">Beverages</option>
                        <option value="desserts">Desserts</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control"
                        rows="5"
                        value={newMenuItem.description}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your delicious item..."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <div className="form-check">
                        <input 
                          className="form-check-input"
                          type="checkbox"
                          checked={newMenuItem.is_available}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_available: e.target.checked }))}
                        />
                        <label className="form-check-label">
                          Available for ordering
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddMenuItem}
                  disabled={saving || !newMenuItem.name || !newMenuItem.price}
                >
                  {saving ? 'Adding...' : 'Add Menu Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}