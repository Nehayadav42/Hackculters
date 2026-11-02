import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { user, loading, logoutInProgress } = useAuth();
  const location = useLocation();

  if (loading || logoutInProgress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11120f] text-[#c7a96b]">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
}