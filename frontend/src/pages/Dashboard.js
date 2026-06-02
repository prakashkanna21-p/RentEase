import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">RentEase</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md">Logout</button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.username || user.email}!</h1>
        <p className="mt-4 text-gray-600">Your RentEase dashboard is ready. Browse products and manage your rentals.</p>
      </div>
    </div>
  );
};

export default Dashboard;