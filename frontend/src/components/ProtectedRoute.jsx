import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-light" />
          <p className="text-sm text-navy-300 font-medium">Authenticating Portal Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
