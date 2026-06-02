import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAuthenticated(!!token);
    setUser(userData);
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">RentEase</Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-900 px-1 pt-1 text-sm font-medium">Home</Link>
              {isAuthenticated && <Link to="/my-orders" className="text-gray-900 px-1 pt-1 text-sm font-medium">My Rentals</Link>}
              {isAuthenticated && <Link to="/my-maintenance" className="text-gray-900 px-1 pt-1 text-sm font-medium">Support</Link>}
              {user?.role === 'admin' && <Link to="/admin/analytics" className="text-gray-900 px-1 pt-1 text-sm font-medium">Analytics</Link>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" /></svg>
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">Welcome, {user?.username || user?.email?.split('@')[0]}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600">Logout</button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-gray-700 px-3 py-2 text-sm">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;