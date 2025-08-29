import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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

  return (
    <div className="container mt-5">
      <h2>Vendor Dashboard</h2>
      <p className="text-muted">Welcome, {user?.email}</p>

      <h4 className="mt-4">Add New Menu Item</h4>
      <form
        onSubmit={handleCreateItem}
        className="mb-4"
        style={{ maxWidth: "500px" }}
      >
        <div className="mb-2">
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Item name"
            value={newItem.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            name="description"
            className="form-control"
            placeholder="Item description"
            value={newItem.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-2">
          <input
            type="number"
            step="0.01"
            name="price"
            className="form-control"
            placeholder="Item price"
            value={newItem.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImageChange}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Item"}
        </button>
      </form>

      <h4>My Menu Items</h4>
      {menuItems.length === 0 ? (
        <p className="text-muted">No items yet.</p>
      ) : (
        <ul className="list-group">
          {menuItems.map((item) => (
            <li key={item.id} className="list-group-item">
              {editingItemId === item.id ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    className="form-control mb-1"
                    value={editedItem.name}
                    onChange={handleEditChange}
                  />
                  <textarea
                    name="description"
                    className="form-control mb-1"
                    value={editedItem.description}
                    onChange={handleEditChange}
                  />
                  <input
                    type="number"
                    name="price"
                    className="form-control mb-2"
                    value={editedItem.price}
                    onChange={handleEditChange}
                  />
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleSaveEdit(item.id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditingItemId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          marginRight: "10px",
                        }}
                      />
                    )}
                    <div>
                      <strong>{item.name}</strong>
                      <div className="text-muted small">{item.description}</div>
                    </div>
                  </div>
                  <div>
                    <span className="me-3">${item.price.toFixed(2)}</span>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
