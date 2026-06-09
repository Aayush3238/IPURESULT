import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import StudentProfileCard from "../components/StudentProfileCard.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function ProfilePage() {
  const { portalSessionId } = useAuth();

  // SEO Title
  useEffect(() => {
    document.title = "IPUNex Results | Student Profile";
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-4 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white sm:text-2xl font-heading">
          Student Profile Information
        </h1>
        <p className="text-xs text-navy-300 mt-1">
          Verification records retrieved securely from the university student portal.
        </p>
      </div>

      <div className="bg-[#111827]/30 border border-white/5 rounded-2xl p-6 shadow-xl">
        <StudentProfileCard
          portalSessionId={portalSessionId}
          apiBase={API_BASE}
          isDrawer={false}
        />
      </div>
    </div>
  );
}
