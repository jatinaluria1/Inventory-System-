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
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)' }}>
              <Package size={28} />
              Inventory
            </h2>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink 
              to="/" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={({ isActive }) => ({ justifyContent: 'flex-start', background: isActive ? '' : 'transparent', color: isActive ? '' : 'var(--text-muted)' })}
            >
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink 
              to="/products" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={({ isActive }) => ({ justifyContent: 'flex-start', background: isActive ? '' : 'transparent', color: isActive ? '' : 'var(--text-muted)' })}
            >
              <Package size={20} /> Products
            </NavLink>
            <NavLink 
              to="/customers" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={({ isActive }) => ({ justifyContent: 'flex-start', background: isActive ? '' : 'transparent', color: isActive ? '' : 'var(--text-muted)' })}
            >
              <Users size={20} /> Customers
            </NavLink>
            <NavLink 
              to="/orders" 
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
              style={({ isActive }) => ({ justifyContent: 'flex-start', background: isActive ? '' : 'transparent', color: isActive ? '' : 'var(--text-muted)' })}
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
