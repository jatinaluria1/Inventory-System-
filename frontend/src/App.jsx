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
          <div className="brand-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
            <div className="logo-icon-wrapper" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
              color: '#6366f1'
            }}>
              <Package size={22} style={{ strokeWidth: 2.2 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                lineHeight: '1.1',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                INVEN<span style={{ background: 'linear-gradient(to right, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TORY</span>
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '2px'
              }}>
                Management
              </span>
            </div>
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
