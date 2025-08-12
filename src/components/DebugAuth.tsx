import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? 'Logged in' : 'Not logged in'}</div>
        {user && (
          <>
            <div>Email: {user.email}</div>
            <div>Org: {user.organization?.name || 'Unknown'}</div>
            <div>Role: {user.role}</div>
          </>
        )}
        <div>localStorage: {localStorage.getItem('authUser') ? 'Has data' : 'Empty'}</div>
      </div>
    </div>
  );
};

export default DebugAuth;
