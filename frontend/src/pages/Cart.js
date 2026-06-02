import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (item) => {
    if (!item.image) {
      return 'https://via.placeholder.com/100x100/cccccc/white?text=No+Image';
    }
    
    let imagePath = item.image;
    
    // If it already has full URL, return as is
    if (imagePath.startsWith('http://localhost')) {
      return imagePath;
    }
    
    // If it starts with /media, add localhost
    if (imagePath.startsWith('/media')) {
      return `http://localhost:8000${imagePath}`;
    }
    
    // If it starts with media/ (no leading slash)
    if (imagePath.startsWith('media/')) {
      return `http://localhost:8000/${imagePath}`;
    }
    
    // Default fallback - assume it's just the filename
    return `http://localhost:8000/media/${imagePath}`;
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    // Trigger storage event for navbar update
    window.dispatchEvent(new Event('storage'));
  };

  const updateTenure = (index, newTenure) => {
    const updated = [...cartItems];
    updated[index].tenure = newTenure;
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    toast.success('Item removed from cart');
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-12">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to rent yet.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100/ff6b6b/white?text=Error';
                    }}
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                  <p className="text-blue-600 font-bold">{formatPrice(item.monthly_rent)}/month</p>
                  
                  {/* Quantity and Tenure Controls */}
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Qty:</span>
                      <button 
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-7 h-7 bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-7 h-7 bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Tenure:</span>
                      <select 
                        value={item.tenure}
                        onChange={(e) => updateTenure(index, parseInt(e.target.value))}
                        className="border rounded-md px-2 py-1 text-sm"
                      >
                        <option value={1}>1 month</option>
                        <option value={3}>3 months (5% off)</option>
                        <option value={6}>6 months (10% off)</option>
                        <option value={12}>12 months (15% off)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Price and Remove */}
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-600">
                    {formatPrice(item.monthly_rent * item.quantity * item.tenure)}
                  </p>
                  <p className="text-xs text-gray-500">for {item.tenure} months</p>
                  <button 
                    onClick={() => removeItem(index)}
                    className="mt-2 text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rent:</span>
                  <span className="font-semibold">{formatPrice(calculateTotalRent())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-semibold">{formatPrice(calculateTotalDeposit())}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total to Pay:</span>
                    <span className="text-blue-600">{formatPrice(calculateGrandTotal())}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Security deposit refundable after rental period
                  </p>
                </div>
              </div>
              
              <Link to="/checkout">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-6">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;