import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import api from '../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1 }]
  });

  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      showToast('error', "Failed to load order data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: parseInt(formData.customer_id, 10),
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseInt(item.quantity, 10)
        }))
      };
      await api.post('/orders', payload);
      setShowCreateModal(false);
      fetchData(); // Refresh all data to get updated stock
      setFormData({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      showToast('success', "Order placed successfully!");
    } catch (error) {
      showToast('error', error.response?.data?.detail || "An error occurred while creating order");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }]
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to cancel/delete this order?")) {
      try {
        await api.delete(`/orders/${id}`);
        fetchData();
        showToast('success', "Order cancelled and inventory restored!");
      } catch (error) {
        showToast('error', "Failed to cancel order");
      }
    }
  };

  const openView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Orders</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData({ customer_id: customers.length > 0 ? customers[0].id : '', items: [{ product_id: '', quantity: 1 }] });
            setShowCreateModal(true);
          }}
          disabled={customers.length === 0 || products.length === 0}
        >
          <Plus size={18} /> Create Order
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer ID</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.customer_id}</td>
                <td>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                <td>${order.total_amount.toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.5rem' }} onClick={() => openView(order)}>
                      <Eye size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(order.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>Create New Order</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Select Customer</label>
                <select 
                  required 
                  className="form-select" 
                  name="customer_id" 
                  value={formData.customer_id} 
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                >
                  <option value="" disabled>Select a customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Order Items</span>
                  <button type="button" className="btn btn-primary" onClick={addItemRow} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                    <Plus size={14} /> Add Item
                  </button>
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {formData.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select 
                        required 
                        className="form-select" 
                        value={item.product_id} 
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        style={{ flex: 3 }}
                      >
                        <option value="" disabled>Select product</option>
                        {products.map(p => (
                           <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                             {p.name} (${p.price.toFixed(2)}) - {p.quantity_in_stock} in stock
                           </option>
                        ))}
                      </select>
                      <input 
                        required 
                        type="number" 
                        min="1" 
                        className="form-input" 
                        placeholder="Qty"
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        style={{ flex: 1, minWidth: '70px' }}
                      />
                      {formData.items.length > 1 && (
                        <button type="button" className="btn btn-danger" style={{ padding: '0.6rem' }} onClick={() => removeItemRow(index)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
 
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Order</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {showViewModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2>Order Details</h2>
            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Order Reference:</span> <strong style={{ color: 'white' }}>#{selectedOrder.id}</strong>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Date Placed:</span> <strong style={{ color: 'white' }}>{new Date(selectedOrder.created_at).toLocaleString()}</strong>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer Reference:</span> <strong style={{ color: 'white' }}>ID #{selectedOrder.customer_id}</strong>
              </p>
            </div>
 
            <div className="table-container" style={{ marginBottom: '1.5rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>#{item.product_id}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                ${selectedOrder.total_amount.toFixed(2)}
              </span>
            </div>
 
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowViewModal(false)}>
              Close Details
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
