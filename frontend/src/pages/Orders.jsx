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
      console.error("Failed to fetch data", error);
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
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred while creating order");
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
      } catch (error) {
        console.error("Failed to delete order", error);
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', backgroundColor: 'var(--bg-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Create Order</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Customer</label>
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
              
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Products</label>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <select 
                      required 
                      className="form-select" 
                      value={item.product_id} 
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      style={{ flex: 2 }}
                    >
                      <option value="" disabled>Select product</option>
                      {products.map(p => (
                         <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                           {p.name} (${p.price}) - {p.quantity_in_stock} in stock
                         </option>
                      ))}
                    </select>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      className="form-input" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {formData.items.length > 1 && (
                      <button type="button" className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => removeItemRow(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn" onClick={addItemRow} style={{ marginTop: '0.5rem', width: '100%' }}>
                  <Plus size={16} /> Add Another Product
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Order</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', backgroundColor: 'var(--bg-color)' }}>
            <h2>Order #{selectedOrder.id} Details</h2>
            <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              <p>Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p>Customer ID: {selectedOrder.customer_id}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                Total: ${selectedOrder.total_amount.toFixed(2)}
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
                      <td>{item.product_id}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
