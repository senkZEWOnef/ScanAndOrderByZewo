import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function BusinessCustomization({ user, vendorProfile, onProfileUpdate }) {
  const [customization, setCustomization] = useState({
    logo_url: vendorProfile?.logo_url || '',
    primary_color: vendorProfile?.primary_color || '#667eea',
    secondary_color: vendorProfile?.secondary_color || '#764ba2',
    accent_color: vendorProfile?.accent_color || '#ffc107',
    description: vendorProfile?.description || '',
    cuisine_type: vendorProfile?.cuisine_type || 'american'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(vendorProfile?.logo_url || null);

  const handleInputChange = (field, value) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return customization.logo_url;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(filePath, logoFile);

    if (uploadError) {
      throw new Error('Logo upload failed: ' + uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('business-assets')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let logoUrl = customization.logo_url;
      
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const { error } = await supabase
        .from('vendor_profiles')
        .update({
          logo_url: logoUrl,
          primary_color: customization.primary_color,
          secondary_color: customization.secondary_color,
          accent_color: customization.accent_color,
          description: customization.description,
          cuisine_type: customization.cuisine_type
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update the customization state with the new logo URL
      setCustomization(prev => ({ ...prev, logo_url: logoUrl }));
      
      // Notify parent component
      onProfileUpdate({ 
        ...vendorProfile, 
        ...customization, 
        logo_url: logoUrl 
      });

      alert('✅ Business customization saved successfully!');
    } catch (error) {
      alert('Error saving customization: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const colorPresets = [
    { name: 'Ocean Blue', primary: '#667eea', secondary: '#764ba2', accent: '#20c997' },
    { name: 'Sunset Orange', primary: '#ff6b6b', secondary: '#feca57', accent: '#ff9ff3' },
    { name: 'Forest Green', primary: '#00b894', secondary: '#55a3ff', accent: '#fdcb6e' },
    { name: 'Purple Rain', primary: '#a55eea', secondary: '#3742fa', accent: '#2ed573' },
    { name: 'Fire Red', primary: '#ff3838', secondary: '#ff9500', accent: '#ffdd59' },
    { name: 'Cool Gray', primary: '#57606f', secondary: '#747d8c', accent: '#5352ed' }
  ];

  return (
    <div className="row g-4">
      {/* Logo Upload */}
      <div className="col-lg-6">
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">🎨 Business Logo</h5>
            
            <div className="text-center mb-4">
              <div className="d-inline-block position-relative">
                {previewLogo ? (
                  <img
                    src={previewLogo}
                    alt="Business Logo"
                    className="rounded-3 border"
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'contain',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                ) : (
                  <div 
                    className="bg-light rounded-3 border d-flex align-items-center justify-content-center"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <span className="text-muted fs-1">🏪</span>
                  </div>
                )}
                <div className="position-absolute bottom-0 end-0">
                  <label className="btn btn-primary btn-sm rounded-circle" style={{ width: '40px', height: '40px' }}>
                    <span>📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="d-none"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-3">
                <small className="text-muted">Click camera to upload your logo<br/>Recommended: 500x500px, PNG/JPG</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="col-lg-6">
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">📝 Business Details</h5>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Business Description</label>
              <textarea
                className="form-control"
                style={{ borderRadius: '12px' }}
                rows="3"
                placeholder="Tell customers about your amazing food truck..."
                value={customization.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength="200"
              />
              <div className="form-text">
                {customization.description.length}/200 characters
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Cuisine Type</label>
              <select
                className="form-select"
                style={{ borderRadius: '12px' }}
                value={customization.cuisine_type}
                onChange={(e) => handleInputChange('cuisine_type', e.target.value)}
              >
                <option value="american">🍔 American</option>
                <option value="mexican">🌮 Mexican</option>
                <option value="italian">🍝 Italian</option>
                <option value="asian">🍜 Asian</option>
                <option value="jamaican">🏝️ Jamaican</option>
                <option value="haitian">🇭🇹 Haitian</option>
                <option value="puerto_rican">🇵🇷 Puerto Rican</option>
                <option value="indian">🍛 Indian</option>
                <option value="greek">🫒 Greek</option>
                <option value="middle_eastern">🥙 Middle Eastern</option>
                <option value="soul_food">🍗 Soul Food</option>
                <option value="desserts">🍰 Desserts</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Color Customization */}
      <div className="col-12">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">🎨 Brand Colors</h5>
            
            {/* Color Presets */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3">Quick Presets</h6>
              <div className="row g-2">
                {colorPresets.map((preset, index) => (
                  <div key={index} className="col-lg-2 col-md-3 col-4">
                    <button
                      className="btn w-100 p-2 border"
                      style={{ borderRadius: '12px' }}
                      onClick={() => {
                        setCustomization(prev => ({
                          ...prev,
                          primary_color: preset.primary,
                          secondary_color: preset.secondary,
                          accent_color: preset.accent
                        }));
                      }}
                    >
                      <div className="d-flex justify-content-center mb-2">
                        <div 
                          className="rounded me-1" 
                          style={{ width: '15px', height: '15px', backgroundColor: preset.primary }}
                        ></div>
                        <div 
                          className="rounded me-1" 
                          style={{ width: '15px', height: '15px', backgroundColor: preset.secondary }}
                        ></div>
                        <div 
                          className="rounded" 
                          style={{ width: '15px', height: '15px', backgroundColor: preset.accent }}
                        ></div>
                      </div>
                      <small className="fw-semibold">{preset.name}</small>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Primary Color</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={customization.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={customization.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Secondary Color</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={customization.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={customization.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Accent Color</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={customization.accent_color}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={customization.accent_color}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <h6 className="fw-semibold mb-3">Preview</h6>
              <div 
                className="p-4 rounded-3"
                style={{ 
                  background: `linear-gradient(45deg, ${customization.primary_color}, ${customization.secondary_color})` 
                }}
              >
                <div className="text-white">
                  <h5 className="mb-2">{vendorProfile?.business_name || 'Your Business Name'}</h5>
                  <div 
                    className="badge"
                    style={{ backgroundColor: customization.accent_color, color: '#000' }}
                  >
                    Order Now
                  </div>
                </div>
              </div>
            </div>

            <div className="text-end mt-4">
              <button 
                className="btn btn-primary btn-lg px-4"
                style={{ borderRadius: '12px' }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  '✅ Save Customization'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}