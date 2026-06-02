import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import MaintenanceRequest from './pages/MaintenanceRequest';
import MyMaintenance from './pages/MyMaintenance';
import AdminAnalytics from './pages/AdminAnalytics';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/maintenance-request" element={
          <ProtectedRoute>
            <MaintenanceRequest />
          </ProtectedRoute>
        } />
        <Route path="/my-maintenance" element={
          <ProtectedRoute>
            <MyMaintenance />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;