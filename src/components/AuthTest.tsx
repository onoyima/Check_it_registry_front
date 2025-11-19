import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest: React.FC = () => {
  const { user, loading, login, logout } = useAuth();

  const testLogin = () => {
    // Simulate successful login
    const mockUser = {
      id: 'test-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    const mockToken = 'test-jwt-token';
    login(mockToken, mockUser);
  };

  if (loading) {
    return <div>Loading auth state...</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Auth Test Component</h3>
      <p><strong>User:</strong> {user ? user.name : 'Not logged in'}</p>
      <p><strong>Email:</strong> {user ? user.email : 'N/A'}</p>
      <p><strong>Role:</strong> {user ? user.role : 'N/A'}</p>
      
      <div style={{ marginTop: '10px' }}>
        {user ? (
          <button onClick={logout} style={{ padding: '8px 16px', marginRight: '10px' }}>
            Logout
          </button>
        ) : (
          <button onClick={testLogin} style={{ padding: '8px 16px', marginRight: '10px' }}>
            Test Login
          </button>
        )}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>Token in localStorage: {localStorage.getItem('auth_token') ? 'Present' : 'Not found'}</p>
        <p>User data in localStorage: {localStorage.getItem('user_data') ? 'Present' : 'Not found'}</p>
      </div>
    </div>
  );
};

export default AuthTest;