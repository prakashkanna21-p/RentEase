import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    delivery_date: '',
    delivery_note: '',
  });

  useEffect(() => {
    loadCart();
    loadUserData();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/');
    }
    setCartItems(cart);
  };

  const loadUserData = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalRent = () => {
    return cartItems.reduce((sum, item) => {
      const rent = parseFloat(item.monthly_rent) || 0;
      const qty = parseInt(item.quantity) || 0;
      const tenure = parseInt(item.tenure) || 0;
      return sum + (rent * qty * tenure);
    }, 0);
  };

  const calculateTotalDeposit = () => {
    return cartItems.reduce((sum, item) => {
      const deposit = parseFloat(item.security_deposit) || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + (deposit * qty);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateTotalRent() + calculateTotalDeposit();
  };

  const getMinDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.delivery_date) {
      toast.error('Please select a delivery date');
      return;
    }
    
    setLoading(true);
    
    const totalRent = calculateTotalRent();
    const totalDeposit = calculateTotalDeposit();
    const grandTotal = totalRent + totalDeposit;
    
    const orderData = {
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      delivery_date: formData.delivery_date,
      delivery_note: formData.delivery_note || '',
      cart_items: cartItems.map(item => ({
        id: parseInt(item.id),
        name: item.name,
        monthly_rent: parseFloat(item.monthly_rent),
        security_deposit: parseFloat(item.security_deposit),
        quantity: parseInt(item.quantity),
        tenure: parseInt(item.tenure),
      })),
      total_rent: totalRent,
      total_deposit: totalDeposit,
      grand_total: grandTotal,
    };
    
    console.log('Order Data:', orderData);
    
    try {
      const response = await api.post('/orders/create/', orderData);
      
      if (response.data.success) {
        localStorage.removeItem('cart');
        toast.success(`Order placed! Order ID: ${response.data.order_number}`);
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    name="address"
                    required
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                  <input
                    type="date"
                    name="delivery_date"
                    required
                    min={getMinDeliveryDate()}
                    value={formData.delivery_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                  <textarea
                    name="delivery_note"
                    rows="2"
                    value={formData.delivery_note}
                    onChange={handleChange}
                    placeholder="Any special instructions for delivery"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="border-b pb-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × {item.tenure} months
                    </p>
                    <p className="text-blue-600 font-semibold">
                      {formatPrice(parseFloat(item.monthly_rent) * parseInt(item.quantity) * parseInt(item.tenure))}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total Rent:</span>
                  <span>{formatPrice(calculateTotalRent())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit:</span>
                  <span>{formatPrice(calculateTotalDeposit())}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total to Pay:</span>
                  <span className="text-blue-600">{formatPrice(calculateGrandTotal())}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Security deposit is refundable after rental period ends, subject to no damage.
                </p>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-6 disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;