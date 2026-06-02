import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input type="tel" name="phone" onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="confirmPassword" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;