import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity_in_stock: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        quantity_in_stock: parseInt(formData.quantity_in_stock, 10)
      };

      if (editId) {
        await api.put(`/products/${editId}`, data);
      } else {
        await api.post('/products', data);
      }
      setShowModal(false);
      fetchProducts();
      setFormData({ name: '', sku: '', price: '', quantity_in_stock: '' });
      setEditId(null);
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  const openEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock
    });
    setEditId(product.id);
    setShowModal(true);
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData({ name: '', sku: '', price: '', quantity_in_stock: '' });
            setEditId(null);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${product.quantity_in_stock < 10 ? 'badge-danger' : 'badge-success'}`}>
                    {product.quantity_in_stock}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.5rem' }} onClick={() => openEdit(product)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', backgroundColor: 'var(--bg-color)' }}>
            <h2>{editId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input required className="form-input" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input required className="form-input" name="sku" value={formData.sku} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input required type="number" step="0.01" min="0.01" className="form-input" name="price" value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input required type="number" min="0" className="form-input" name="quantity_in_stock" value={formData.quantity_in_stock} onChange={handleInputChange} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
