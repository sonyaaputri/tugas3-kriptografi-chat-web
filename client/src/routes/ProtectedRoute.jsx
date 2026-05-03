import { Navigate } from 'react-router-dom';

/**
 * Protected route component that checks if user is authenticated
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function ProtectedRoute({ children }) {
  // Check if user token exists in localStorage
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
