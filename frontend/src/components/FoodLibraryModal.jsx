import { useState } from "react";
import { massiveFoodLibrary, cuisineTemplates } from "../data/massiveFoodLibrary";

export default function FoodLibraryModal({ 
  isOpen, 
  onClose, 
  onAddItem, 
  onPopulateMenu 
}) {
  const [selectedCuisine, setSelectedCuisine] = useState('mexican');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  if (!isOpen) return null;

  const filteredItems = massiveFoodLibrary[selectedCuisine].filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 p-4">
            <div>
              <h4 className="modal-title fw-bold">📚 Food Library</h4>
              <p className="text-muted mb-0">Choose from our curated collection of popular menu items</p>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-4">
            {/* Cuisine Selection */}
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="fw-bold mb-3">Choose Cuisine Type</h6>
                <div className="row g-3">
                  {Object.entries(cuisineTemplates).map(([name, type]) => (
                    <div key={type} className="col-lg-2 col-md-3 col-4">
                      <button
                        className={`btn w-100 h-100 border-0 ${
                          selectedCuisine === type 
                            ? 'btn-primary' 
                            : 'btn-outline-secondary'
                        }`}
                        style={{ 
                          borderRadius: '12px',
                          background: selectedCuisine === type 
                            ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                            : 'transparent'
                        }}
                        onClick={() => setSelectedCuisine(type)}
                      >
                        <div className="text-center p-3">
                          <div className="fs-2 mb-2">
                            {type === 'mexican' && '🌮'}
                            {type === 'american' && '🍔'}
                            {type === 'asian' && '🍜'}
                            {type === 'pizza' && '🍕'}
                            {type === 'dessert' && '🍰'}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            color: selectedCuisine === type ? '#ffffff' : '#000000',
                            textShadow: selectedCuisine === type ? '1px 1px 2px rgba(0,0,0,0.5)' : '1px 1px 2px rgba(255,255,255,0.8)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {name.replace(/^[^\w\s]+\s*/, '').split(' ')[0]}
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Search and Quick Actions */}
            <div className="row mb-4">
              <div className="col-lg-6">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  style={{ borderRadius: '12px' }}
                  placeholder="🔍 Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-lg-6 text-end">
                <button
                  className="btn btn-success btn-lg"
                  style={{ borderRadius: '12px' }}
                  onClick={() => onPopulateMenu(selectedCuisine)}
                >
                  ⚡ Add All {massiveFoodLibrary[selectedCuisine].length} Items
                </button>
              </div>
            </div>

            {/* Items Grid */}
            <div className="row g-3">
              {filteredItems.map((item, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                    <div style={{ height: '200px', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{item.name}</h6>
                        <span className="fs-5 fw-bold text-success">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-muted small mb-3 lh-sm">{item.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark">{item.category}</span>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            style={{ borderRadius: '8px' }}
                            onClick={() => setEditingItem(item)}
                            title="Edit Image"
                          >
                            📝
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: '8px' }}
                            onClick={() => onAddItem(item)}
                          >
                            Add to Menu
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-5">
                <div className="fs-1 mb-3">🔍</div>
                <h5 className="text-muted">No items found</h5>
                <p className="text-muted">Try searching for something else</p>
              </div>
            )}
          </div>
          
          <div className="modal-footer border-0 p-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Image Edit Modal */}
      {editingItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">🖼️ Edit Image for {editingItem.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setEditingItem(null);
                    setNewImageUrl('');
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Current Image:</label>
                  <div className="text-center mb-3">
                    <img 
                      src={editingItem.image_url} 
                      alt={editingItem.name}
                      className="img-fluid"
                      style={{ maxHeight: '200px', borderRadius: '12px' }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Image URL:</label>
                  <input
                    type="url"
                    className="form-control form-control-lg"
                    style={{ borderRadius: '12px' }}
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <div className="form-text">Tip: Use high-quality food images from Unsplash or similar sources</div>
                </div>
                {newImageUrl && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Preview:</label>
                    <div className="text-center">
                      <img 
                        src={newImageUrl} 
                        alt="Preview"
                        className="img-fluid"
                        style={{ maxHeight: '200px', borderRadius: '12px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 p-4">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingItem(null);
                    setNewImageUrl('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    if (newImageUrl.trim()) {
                      // Update the item's image URL in the library
                      editingItem.image_url = newImageUrl.trim();
                      setEditingItem(null);
                      setNewImageUrl('');
                      // Force re-render by updating state
                      setSearchTerm(searchTerm + ' ');
                      setSearchTerm(searchTerm.trim());
                    }
                  }}
                  disabled={!newImageUrl.trim()}
                >
                  Update Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}