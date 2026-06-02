import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/analytics/');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-gray-500">Total Revenue</h3><p className="text-3xl font-bold text-blue-600">{formatPrice(data?.revenue?.total)}</p></div>
          <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-gray-500">Monthly Revenue</h3><p className="text-3xl font-bold text-green-600">{formatPrice(data?.revenue?.monthly)}</p></div>
          <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-gray-500">Weekly Revenue</h3><p className="text-3xl font-bold text-purple-600">{formatPrice(data?.revenue?.weekly)}</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-gray-500">Total Orders</h3><p className="text-3xl font-bold">{data?.orders?.total}</p></div>
          <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-gray-500">Pending Orders</h3><p className="text-3xl font-bold text-yellow-600">{data?.orders?.pending}</p></div>
          <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-gray-500">Completed Orders</h3><p className="text-3xl font-bold text-green-600">{data?.orders?.completed}</p></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 mb-4">Top Rented Products</h3>
          {data?.products?.top_products.map((p, i) => (
            <div key={i} className="flex justify-between border-b py-2"><span>{i+1}. {p.name}</span><span className="text-blue-600 font-bold">{p.count} rentals</span></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;