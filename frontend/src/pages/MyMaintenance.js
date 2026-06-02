import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/maintenance/my-requests/');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    const colors = { urgent: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' };
    return colors[p] || 'bg-gray-100';
  };

  const getStatusColor = (s) => {
    const colors = { pending: 'bg-gray-100', assigned: 'bg-blue-100 text-blue-800', in_progress: 'bg-purple-100 text-purple-800', resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-100' };
    return colors[s] || 'bg-gray-100';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
          <Link to="/maintenance-request" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ New Request</Link>
        </div>
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No maintenance requests yet.</p>
            <Link to="/maintenance-request" className="inline-block mt-4 text-blue-600 hover:underline">Submit your first request →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div><p className="text-sm text-gray-500">Request #{req.id}</p><p className="font-semibold text-lg">{req.product_name}</p></div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(req.priority)}`}>{req.priority.toUpperCase()}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>{req.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm"><span className="font-medium">Issue:</span> {req.issue_type}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Description:</span> {req.description}</p>
                  {req.admin_notes && <p className="text-sm bg-blue-50 p-2 rounded mt-2"><span className="font-medium">Admin Response:</span> {req.admin_notes}</p>}
                  <p className="text-xs text-gray-400 mt-2">Submitted: {formatDate(req.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMaintenance;