import { useAuth } from '../contexts/AuthContext';

const AuthTest = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Auth Status</h3>
      <p><strong>User:</strong> {user ? user.name : 'Not logged in'}</p>
      <p><strong>Email:</strong> {user ? user.email : 'N/A'}</p>
      <p><strong>Role:</strong> {user ? user.role : 'N/A'}</p>
      <p>Token: {localStorage.getItem('auth_token') ? 'Present' : 'Not found'}</p>
    </div>
  );
};

export default AuthTest;