import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SimpleImageUpload() {
  const [vendor, setVendor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dbTest, setDbTest] = useState(null);

  useEffect(() => {
    fetchVendor();
  }, []);

  const createTestVendor = async () => {
    try {
      console.log('🏗️ Creating test vendor...');
      const { data, error } = await supabase
        .from('vendor_profiles')
        .insert({
          business_name: 'Test Restaurant',
          description: 'A test restaurant for image uploads',
          slug: 'test-restaurant-' + Date.now()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create test vendor:', error);
        alert('Failed to create test vendor: ' + error.message);
      } else {
        console.log('✅ Created test vendor:', data);
        setVendor(data);
      }
    } catch (error) {
      console.error('❌ Error creating test vendor:', error);
      alert('Error creating test vendor: ' + error.message);
    }
  };

  const testImageUrl = async (url, type) => {
    try {
      console.log(`🧪 Testing ${type} URL: ${url}`);
      
      // Test with fetch
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`📡 Fetch response for ${type}:`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Test with Image object
      const img = new Image();
      img.onload = () => {
        console.log(`✅ ${type} image loaded successfully via Image object`);
      };
      img.onerror = (error) => {
        console.error(`❌ ${type} image failed to load via Image object:`, error);
      };
      img.src = url;
      
    } catch (error) {
      console.error(`❌ Error testing ${type} URL:`, error);
    }
  };

  const fetchVendor = async () => {
    try {
      console.log('🔍 Fetching vendor data...');
      const { data: vendors, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('❌ Database error fetching vendors:', error);
        alert('Database error: ' + error.message);
        return;
      }
      
      console.log('📊 Query result:', { vendors, count: vendors?.length });
      
      if (vendors && vendors.length > 0) {
        console.log('✅ Raw vendor data from DB:', vendors[0]);
        console.log('📸 Logo URL from DB:', vendors[0].logo_url);
        console.log('🖼️ Banner URL from DB:', vendors[0].banner_url);
        
        // Test if URLs are accessible
        if (vendors[0].logo_url) {
          console.log('🧪 Testing logo URL accessibility...');
          testImageUrl(vendors[0].logo_url, 'logo');
        }
        if (vendors[0].banner_url) {
          console.log('🧪 Testing banner URL accessibility...');
          testImageUrl(vendors[0].banner_url, 'banner');
        }
        
        setVendor(vendors[0]);
        console.log('✅ Vendor state updated');
      } else {
        console.warn('⚠️ No vendors found - creating a test vendor');
        createTestVendor();
      }
    } catch (error) {
      console.error('❌ Error fetching vendor:', error);
      alert('Error fetching vendor: ' + error.message);
    }
  };

  const testDatabaseUpdate = async () => {
    if (!vendor) return;
    
    try {
      console.log('🧪 Testing database update with proper URLs...');
      
      // Create test URLs that look like real ones
      const testLogoUrl = `https://glrhcntdappxhrmpcuzy.supabase.co/storage/v1/object/public/vendor-logos/test-logo-${Date.now()}.jpg`;
      const testBannerUrl = `https://glrhcntdappxhrmpcuzy.supabase.co/storage/v1/object/public/vendor-banners/test-banner-${Date.now()}.jpg`;
      
      console.log('📝 Test Logo URL:', testLogoUrl);
      console.log('📝 Test Banner URL:', testBannerUrl);
      
      // Try to update with proper test URLs
      const { data, error } = await supabase
        .from('vendor_profiles')
        .update({ 
          logo_url: testLogoUrl,
          banner_url: testBannerUrl
        })
        .eq('id', vendor.id)
        .select();

      if (error) {
        setDbTest({ success: false, error: error.message });
        console.error('❌ Database test failed:', error);
      } else {
        setDbTest({ success: true, data });
        console.log('✅ Database test successful:', data);
        
        // Refresh vendor data to see the change
        setTimeout(() => {
          fetchVendor();
        }, 500);
      }
    } catch (error) {
      setDbTest({ success: false, error: error.message });
      console.error('❌ Database test error:', error);
    }
  };

  const handleUpload = async (file, type) => {
    if (!file || !vendor) {
      alert('No file or vendor selected');
      return;
    }

    setUploading(true);
    console.log('Starting simple upload:', { type, vendorId: vendor.id });

    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendor.id}_${type}_${Date.now()}.${fileExt}`;
      const bucketName = type === 'logo' ? 'vendor-logos' : 'vendor-banners';
      
      console.log('Uploading to bucket:', bucketName, 'with filename:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        alert('Upload failed: ' + uploadError.message);
        return;
      }

      console.log('Upload successful:', uploadData);

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;
      console.log('🔗 Generated URL:', imageUrl);
      console.log('🔗 URL Data object:', urlData);
      
      // Test the generated URL immediately
      console.log('🧪 Testing newly generated URL...');
      testImageUrl(imageUrl, `${type} (fresh upload)`);

      // 3. Update database
      const updateField = type === 'logo' ? 'logo_url' : 'banner_url';
      
      console.log('Updating database field:', updateField, 'with URL:', imageUrl);
      
      // First, do the update without SELECT
      const { error: updateError } = await supabase
        .from('vendor_profiles')
        .update({ [updateField]: imageUrl })
        .eq('id', vendor.id);

      if (updateError) {
        console.error('Database update failed:', updateError);
        alert('Database update failed: ' + updateError.message);
        return;
      }

      console.log('Database update successful');
      
      // Then verify with a separate SELECT
      const { data: verifyData, error: verifyError } = await supabase
        .from('vendor_profiles')
        .select('id, business_name, logo_url, banner_url')
        .eq('id', vendor.id)
        .single();
      
      if (verifyError) {
        console.warn('Could not verify update:', verifyError);
      } else {
        console.log('✅ Verified update - vendor data:', verifyData);
        console.log('📄 New', updateField, ':', verifyData[updateField]);
        
        // Compare original URL vs stored URL
        console.log('🔍 URL Comparison:');
        console.log('  Original generated URL:', imageUrl);
        console.log('  URL stored in DB:', verifyData[updateField]);
        console.log('  URLs match:', imageUrl === verifyData[updateField]);
        
        // Test the URL that came back from the database
        console.log('🧪 Testing URL retrieved from database...');
        testImageUrl(verifyData[updateField], `${type} (from DB)`);
        
        // Update local state with verified data
        setVendor(verifyData);
        alert(`${type} uploaded and verified successfully!`);
        return;
      }

      // 4. Update local state
      setVendor(prev => ({ ...prev, [updateField]: imageUrl }));
      
      alert(`${type} uploaded successfully!`);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!vendor) {
    return <div>Loading vendor...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>🧪 Simple Image Upload Test</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Current Vendor Info:</h6>
              <ul>
                <li><strong>ID:</strong> {vendor.id}</li>
                <li><strong>Name:</strong> {vendor.business_name}</li>
                <li><strong>Logo URL:</strong> {vendor.logo_url || 'None'}</li>
                <li><strong>Banner URL:</strong> {vendor.banner_url || 'None'}</li>
              </ul>
              
              <div className="mb-3">
                <button 
                  className="btn btn-sm btn-outline-primary me-2" 
                  onClick={fetchVendor}
                >
                  🔄 Refresh Vendor Data
                </button>
                
                
                <button 
                  className="btn btn-sm btn-info me-2" 
                  onClick={() => {
                    console.log('🔍 Current vendor state:', vendor);
                    if (vendor?.logo_url) testImageUrl(vendor.logo_url, 'current logo');
                    if (vendor?.banner_url) testImageUrl(vendor.banner_url, 'current banner');
                  }}
                >
                  🧪 Test Current URLs
                </button>
                
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={async () => {
                    if (!vendor) return;
                    console.log('🧹 Clearing corrupted test data...');
                    
                    const { error } = await supabase
                      .from('vendor_profiles')
                      .update({ 
                        logo_url: null,
                        banner_url: null
                      })
                      .eq('id', vendor.id);
                    
                    if (error) {
                      console.error('❌ Failed to clear data:', error);
                      alert('Failed to clear data: ' + error.message);
                    } else {
                      console.log('✅ Cleared corrupted data');
                      alert('Cleared corrupted test data. Now upload fresh images.');
                      fetchVendor();
                    }
                  }}
                >
                  🧹 Clear Corrupted Data
                </button>
              </div>
              
              {dbTest && (
                <div className={`alert ${dbTest.success ? 'alert-success' : 'alert-danger'} small`}>
                  <strong>DB Test:</strong> {dbTest.success ? 'SUCCESS' : 'FAILED'}
                  {dbTest.error && <div>Error: {dbTest.error}</div>}
                  {dbTest.data && <div>Updated: {JSON.stringify(dbTest.data[0])}</div>}
                </div>
              )}
              
              {/* URL Tester */}
              {(vendor?.logo_url || vendor?.banner_url) && (
                <div className="mt-3">
                  <h6>🔗 Test Image URLs:</h6>
                  {vendor.logo_url && (
                    <div className="mb-2">
                      <small className="text-muted">Logo URL:</small><br/>
                      <input 
                        type="text" 
                        className="form-control form-control-sm mb-1" 
                        value={vendor.logo_url} 
                        readOnly 
                      />
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          navigator.clipboard.writeText(vendor.logo_url);
                          alert('Logo URL copied to clipboard! Paste it in a new browser tab.');
                        }}
                      >
                        📋 Copy URL
                      </button>
                      <a 
                        href={vendor.logo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        🔗 Open
                      </a>
                    </div>
                  )}
                  {vendor.banner_url && (
                    <div className="mb-2">
                      <small className="text-muted">Banner URL:</small><br/>
                      <input 
                        type="text" 
                        className="form-control form-control-sm mb-1" 
                        value={vendor.banner_url} 
                        readOnly 
                      />
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          navigator.clipboard.writeText(vendor.banner_url);
                          alert('Banner URL copied to clipboard! Paste it in a new browser tab.');
                        }}
                      >
                        📋 Copy URL
                      </button>
                      <a 
                        href={vendor.banner_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        🔗 Open
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <h6>Test Uploads:</h6>
              
              <div className="mb-3">
                <label className="form-label">Logo Upload:</label>
                <input 
                  type="file" 
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleUpload(e.target.files[0], 'logo');
                    }
                  }}
                  disabled={uploading}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Banner Upload:</label>
                <input 
                  type="file" 
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleUpload(e.target.files[0], 'banner');
                    }
                  }}
                  disabled={uploading}
                />
              </div>
              
              {uploading && (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm"></div>
                  <span className="ms-2">Uploading...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Preview */}
          <div className="row mt-4">
            <div className="col-12">
              <h6>Preview:</h6>
              <div className="row">
                <div className="col-md-6">
                  <strong>Logo:</strong>
                  {vendor.logo_url ? (
                    <div>
                      <img 
                        src={vendor.logo_url} 
                        alt="Logo" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        className="border rounded mt-2"
                      />
                      <div className="small text-muted">{vendor.logo_url}</div>
                    </div>
                  ) : (
                    <div className="text-muted">No logo uploaded</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <strong>Banner:</strong>
                  {vendor.banner_url ? (
                    <div>
                      <img 
                        src={vendor.banner_url} 
                        alt="Banner" 
                        style={{ width: '200px', height: '100px', objectFit: 'cover' }}
                        className="border rounded mt-2"
                      />
                      <div className="small text-muted">{vendor.banner_url}</div>
                    </div>
                  ) : (
                    <div className="text-muted">No banner uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}