import React from 'react';
import useAuthStore from '../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        {user ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-lg">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-lg">
                  {new Date(user.date_joined).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
