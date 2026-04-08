import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace state={{ userId: user.id, email: user.email }} />;
  }

  if (user && !user.universityId) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-0 flex flex-col flex-1 bg-[radial-gradient(1200px_500px_at_20%_-10%,theme(colors.primary.100),transparent_60%),radial-gradient(900px_400px_at_90%_0%,theme(colors.surface.100),transparent_55%)] bg-surface-50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
