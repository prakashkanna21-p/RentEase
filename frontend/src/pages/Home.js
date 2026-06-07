import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await productService.getAll(params);
      console.log('Products loaded:', response.data);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Products error:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      console.log('Categories loaded:', response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Categories error:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (product) => {
    if (!product.image) return 'https://via.placeholder.com/300x200/cccccc/white?text=No+Image';
    if (product.image.startsWith('http')) return product.image;
    return `http://localhost:8000${product.image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold">Rent Furniture & Appliances</h1>
        <p className="text-xl mt-2">Affordable monthly rentals for your home</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-2 rounded-full ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-6 py-2 rounded-full ${selectedCategory === cat.slug ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available.</p>
            <p className="text-sm text-gray-500 mt-2">Add products in the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <img src={getImageUrl(product)} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{product.category_name}</span>
                  <h3 className="font-semibold text-lg mt-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{formatPrice(product.monthly_rent)}<span className="text-sm text-gray-500">/month</span></p>
                  <p className="text-sm text-gray-500">Deposit: {formatPrice(product.security_deposit)}</p>
                  <Link to={`/product/${product.id}`} className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;