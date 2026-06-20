import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div style={{ padding: '0 0.5rem', marginBottom: '2.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', fontSize: '1.6rem', fontWeight: 800 }}>
              <Package size={26} style={{ strokeWidth: 2.5 }} />
              <span style={{ background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Inventory
              </span>
            </h2>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <NavLink 
              to="/" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', color: 'inherit' }}
            >
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink 
              to="/products" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', color: 'inherit' }}
            >
              <Package size={20} /> Products
            </NavLink>
            <NavLink 
              to="/customers" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', color: 'inherit' }}
            >
              <Users size={20} /> Customers
            </NavLink>
            <NavLink 
              to="/orders" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={{ justifyContent: 'flex-start', color: 'inherit' }}
            >
              <ShoppingCart size={20} /> Orders
            </NavLink>
          </nav>
        </aside>
 
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
