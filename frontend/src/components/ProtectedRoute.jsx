import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-10 text-center text-red-500">Access Denied: You do not have permission to view this page.</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;