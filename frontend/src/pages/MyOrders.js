import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-orders/');
      console.log('Orders:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'delivered'].includes(order.status)
  );
  
  const pastOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Rentals</h1>

        {/* Active Rentals */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Active Rentals ({activeOrders.length})
          </h2>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No active rentals.</p>
              <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-l-4 border-green-500 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                        <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <p className="font-semibold">Delivery Address:</p>
                      <p className="text-sm text-gray-600">{order.address}, {order.city} - {order.pincode}</p>
                      <p className="text-sm text-gray-600">Delivery Date: {formatDate(order.delivery_date)}</p>
                    </div>
                    
                    <div className="mt-3 border-t pt-3">
                      <p className="font-semibold mb-2">Items:</p>
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.product_name} x {item.quantity} ({item.tenure} months)</span>
                          <span className="font-semibold">{formatPrice(item.total_rent)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 border-t pt-3 flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Security Deposit:</p>
                        <p className="font-semibold">{formatPrice(order.total_deposit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount:</p>
                        <p className="text-xl font-bold text-blue-600">{formatPrice(order.grand_total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rental History */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Rental History ({pastOrders.length})
          </h2>
          
          {pastOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No past rentals yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden opacity-75">
                  <div className="border-l-4 border-gray-400 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                        <p className="text-sm text-gray-500">Completed on {formatDate(order.updated_at)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.product_name} x {item.quantity} ({item.tenure} months)</span>
                          <span>{formatPrice(item.total_rent)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 border-t pt-3 flex justify-between">
                      <span>Total Paid:</span>
                      <span className="font-semibold">{formatPrice(order.grand_total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;