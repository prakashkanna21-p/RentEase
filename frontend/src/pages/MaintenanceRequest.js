import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const MaintenanceRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    product_name: '',
    issue_type: '',
    description: '',
    priority: 'medium',
    images: '',
  });

  useEffect(() => {
    fetchOrders();
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        order_id: location.state.order_id || '',
        product_name: location.state.product_name || '',
      }));
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderChange = (e) => {
    const orderId = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, order_id: orderId, product_name: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.order_id) {
      toast.error('Please select an order');
      return;
    }
    if (!formData.issue_type || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/orders/maintenance/create/', formData);
      if (response.data.success) {
        toast.success('Maintenance request submitted!');
        navigate('/my-maintenance');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = ['Not Working', 'Damaged', 'Noisy', 'Leaking', 'Installation Issue', 'Missing Parts', 'Other'];
  const priorities = [
    { value: 'low', label: 'Low - Can wait 1 week' },
    { value: 'medium', label: 'Medium - Within 3 days' },
    { value: 'high', label: 'High - Within 24 hours' },
    { value: 'urgent', label: 'Urgent - Immediate' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Request Maintenance</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Rental Order *</label>
            <select name="order_id" value={formData.order_id} onChange={handleOrderChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Select an order...</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>{order.order_number}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
            <select name="issue_type" value={formData.issue_type} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Select issue type...</option>
              {issueTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorities.map((priority) => (
                <label key={priority.value} className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${formData.priority === priority.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <input type="radio" name="priority" value={priority.value} checked={formData.priority === priority.value} onChange={handleChange} className="sr-only" />
                  <span className="text-sm font-medium">{priority.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Please describe the issue in detail..." />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Maintenance Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequest;