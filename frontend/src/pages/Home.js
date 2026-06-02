import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const response = await productService.getAll(params);
      console.log('Products fetched:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // FIXED: Correct getImageUrl function
  const getImageUrl = (product) => {
    if (!product || !product.image) {
      return 'https://via.placeholder.com/400x300/cccccc/white?text=No+Image';
    }
    
    let imagePath = product.image;
    
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
    
    // Default fallback
    return `http://localhost:8000/media/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rent Furniture & Appliances</h1>
          <p className="text-xl md:text-2xl mb-8">Affordable monthly rentals for your home</p>
          
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug === selectedCategory ? '' : category.slug)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedCategory === category.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const imageUrl = getImageUrl(product);
              console.log(`Image for ${product.name}:`, imageUrl);
              
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${imageUrl}`);
                        e.target.src = 'https://via.placeholder.com/400x300/ff6b6b/white?text=Image+Error';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-semibold">{product.category_name}</span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(product.monthly_rent)}<span className="text-sm text-gray-500">/month</span></p>
                      <p className="text-sm text-gray-500">Deposit: {formatPrice(product.security_deposit)}</p>
                    </div>
                    <Link
                      to={`/product/${product.id}`}
                      className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;