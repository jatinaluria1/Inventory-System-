import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    lowStock: 0
  });
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
        setStats({
          products: products.length,
          customers: customersRes.data.length,
          orders: ordersRes.data.length,
          lowStock: products.filter(p => p.quantity_in_stock < 10).length // Threshold for low stock
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.lowStock}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
