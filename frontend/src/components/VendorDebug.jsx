import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function VendorDebug() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVendor, setNewVendor] = useState({
    business_name: '',
    description: '',
    cuisine_type: 'american'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error);
      } else {
        setVendors(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const createTestVendor = async () => {
    if (!newVendor.business_name.trim()) {
      alert('Please enter a business name');
      return;
    }

    try {
      const vendorData = {
        ...newVendor,
        is_active: true
        // Let the database generate the ID
      };

      console.log('Creating vendor:', vendorData);

      const { data, error } = await supabase
        .from('vendor_profiles')
        .insert([vendorData])
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor:', error);
        alert('Error creating vendor: ' + error.message + '\n\nPlease run the database migration first!');
      } else {
        console.log('Created vendor:', data);
        alert(`Vendor created! ${data.slug ? 'Slug: ' + data.slug : 'ID: ' + data.id}`);
        setNewVendor({ business_name: '', description: '', cuisine_type: 'american' });
        fetchVendors();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  const addSlugToVendor = async (vendor) => {
    try {
      const slug = vendor.business_name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        + '-' + vendor.id.substr(0, 8);

      const { error } = await supabase
        .from('vendor_profiles')
        .update({ slug })
        .eq('id', vendor.id);

      if (error) {
        console.error('Error updating vendor:', error);
        alert('Error updating vendor: ' + error.message);
      } else {
        alert(`Added slug: ${slug}`);
        fetchVendors();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading vendors...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <h3>Create Test Vendor</h3>
          <div className="card p-3">
            <div className="mb-3">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                className="form-control"
                value={newVendor.business_name}
                onChange={(e) => setNewVendor({...newVendor, business_name: e.target.value})}
                placeholder="e.g., Joe's Food Truck"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={newVendor.description}
                onChange={(e) => setNewVendor({...newVendor, description: e.target.value})}
                placeholder="Delicious food truck serving..."
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Cuisine Type</label>
              <select
                className="form-control"
                value={newVendor.cuisine_type}
                onChange={(e) => setNewVendor({...newVendor, cuisine_type: e.target.value})}
              >
                <option value="american">American</option>
                <option value="mexican">Mexican</option>
                <option value="italian">Italian</option>
                <option value="asian">Asian</option>
                <option value="jamaican">Jamaican</option>
                <option value="haitian">Haitian</option>
                <option value="puerto_rican">Puerto Rican</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={createTestVendor}>
              Create Test Vendor
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <h3>Existing Vendors ({vendors.length})</h3>
          {vendors.length === 0 ? (
            <div className="alert alert-info">
              No vendors found in database. Create a test vendor to get started!
            </div>
          ) : (
            <div className="list-group">
              {vendors.map(vendor => (
                <div key={vendor.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{vendor.business_name}</h6>
                      <p className="mb-1 small text-muted">{vendor.description}</p>
                      <small>
                        <strong>Slug:</strong> {vendor.slug || 'No slug'} <br/>
                        <strong>ID:</strong> {vendor.id} <br/>
                        <strong>Cuisine:</strong> {vendor.cuisine_type}
                      </small>
                    </div>
                    <div>
                      {vendor.slug ? (
                        <a 
                          href={`/menu/${vendor.slug}`}
                          className="btn btn-sm btn-success"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Menu
                        </a>
                      ) : (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => addSlugToVendor(vendor)}
                        >
                          Add Slug
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}