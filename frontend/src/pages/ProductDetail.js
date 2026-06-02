import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenure, setSelectedTenure] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const tenureOptions = [1, 3, 6, 12];
  const tenureDiscounts = { 1: 0, 3: 5, 6: 10, 12: 15 };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productService.getById(id);
      console.log('Product fetched:', response.data);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/');
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

  const getImageUrl = () => {
  if (!product || !product.image) {
    return 'https://via.placeholder.com/500x400/cccccc/white?text=No+Image';
  }
  
  let imagePath = product.image;
  
  // If image already has full URL with localhost, use it as is
  if (imagePath.startsWith('http://localhost')) {
    return imagePath;
  }
  
  // If image starts with /media, add localhost
  if (imagePath.startsWith('/media')) {
    return `http://localhost:8000${imagePath}`;
  }
  
  // If image starts with media/ (no slash), add slash and localhost
  if (imagePath.startsWith('media/')) {
    return `http://localhost:8000/${imagePath}`;
  }
  
  // Default: assume it's just the filename
  return `http://localhost:8000/media/${imagePath}`;
};
  const calculateTotal = () => {
    if (!product) return { monthlyTotal: 0, discount: 0, totalRent: 0 };
    
    const monthlyTotal = product.monthly_rent * quantity;
    const discount = (monthlyTotal * (tenureDiscounts[selectedTenure] || 0)) / 100;
    const totalRent = (monthlyTotal - discount) * selectedTenure;
    return { monthlyTotal, discount, totalRent };
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      monthly_rent: product.monthly_rent,
      security_deposit: product.security_deposit,
      quantity: quantity,
      tenure: selectedTenure,
      image: product.image,
      category: product.category_name,
    };
    
    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingIndex = existingCart.findIndex(item => item.id === cartItem.id);
    
    if (existingIndex !== -1) {
      existingCart[existingIndex].quantity += quantity;
      existingCart[existingIndex].tenure = selectedTenure;
      toast.success(`Updated ${product.name} quantity to ${existingCart[existingIndex].quantity}`);
    } else {
      existingCart.push(cartItem);
      toast.success(`Added ${product.name} to cart!`);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch storage event for navbar update
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Product not found</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const { monthlyTotal, discount, totalRent } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center overflow-hidden">
              <img
                src={getImageUrl()}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error(`Failed to load image for ${product.name}:`, getImageUrl());
                  e.target.src = 'https://via.placeholder.com/500x400/ff6b6b/white?text=Image+Error';
                }}
              />
            </div>

            {/* Product Info */}
            <div>
              <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                {product.category_name}
              </span>
              <h1 className="text-3xl font-bold text-gray-800 mt-3">{product.name}</h1>
              <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

              {/* Pricing */}
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(product.monthly_rent)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="text-lg font-semibold">{formatPrice(product.security_deposit)}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-sm text-gray-500">
                  <span></span>
                  <span>Refundable at end of rental</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">Quantity:</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold transition"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tenure Selector */}
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">Rental Tenure (months):</label>
                <div className="grid grid-cols-4 gap-3">
                  {tenureOptions.map((months) => (
                    <button
                      key={months}
                      onClick={() => setSelectedTenure(months)}
                      className={`py-3 rounded-lg font-medium transition ${
                        selectedTenure === months
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {months} {months === 1 ? 'Month' : 'Months'}
                      {tenureDiscounts[months] > 0 && (
                        <span className="block text-xs mt-1">
                          {tenureDiscounts[months]}% off
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Price Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent ({quantity} item{quantity > 1 ? 's' : ''}):</span>
                    <span>{formatPrice(monthlyTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Tenure Discount ({tenureDiscounts[selectedTenure]}%):</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Rent for {selectedTenure} month{selectedTenure > 1 ? 's' : ''}:</span>
                    <span className="text-blue-600">{formatPrice(totalRent)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>+ Security Deposit:</span>
                    <span>{formatPrice(product.security_deposit * quantity)}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;