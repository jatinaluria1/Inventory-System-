import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    lowStockCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/orders')
        ]);

        const products = productsRes.data;
        const orders = ordersRes.data;

        const lowStock = products.filter(p => p.quantity_in_stock < 10);

        setStats({
          products: products.length,
          customers: customersRes.data.length,
          orders: orders.length,
          lowStockCount: lowStock.length
        });

        // Get latest 5 orders
        setRecentOrders(orders.slice(0, 5));
        
        // Get low stock products details
        setLowStockProducts(lowStock.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading dashboard analytics...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Real-time inventory and metrics overview.</p>
      </div>
      
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary-color)' }}>
            <Package size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-color)' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: stats.lowStockCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(148, 163, 184, 0.12)', color: stats.lowStockCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.lowStockCount}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Orders Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Orders</h3>
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong style={{ color: 'white' }}>#{order.id}</strong></td>
                    <td>#{order.customer_id}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>${order.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>No orders placed yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Low Stock Alert</h3>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
              Manage Stock <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>In Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td><code style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{product.sku}</code></td>
                    <td>
                      <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={14} /> {product.quantity_in_stock} units
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--success)', padding: '1.5rem 0' }}>All products are sufficiently stocked!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
