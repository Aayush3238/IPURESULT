import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "ipunex_portal_session";
const API_BASE = import.meta.env.VITE_API_BASE || "";

export function AuthProvider({ children }) {
  const [portalSessionId, setPortalSessionId] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.portalSessionId && data.semesters?.length && data.enrollment) {
          // Standardize semesters format
          const filtered = data.semesters.map(s => {
            const val = parseInt(s.value, 10);
            return {
              value: String(val),
              label: `Semester ${val}`,
            };
          }).filter(s => {
            const val = parseInt(s.value, 10);
            return !isNaN(val) && val >= 1 && val <= 8;
          });

          // Compute max semester and append next unreleased semester for the UI (same logic as before)
          const semestersForUI = [...filtered];
          if (semestersForUI.length > 0) {
            const maxSem = Math.max(...semestersForUI.map(s => parseInt(s.value, 10) || 0));
            const nextSem = maxSem + 1;
            if (nextSem <= 8 && !semestersForUI.some(s => parseInt(s.value, 10) === nextSem)) {
              semestersForUI.push({
                value: String(nextSem),
                label: `Semester ${nextSem}`,
              });
            }
          }

          setPortalSessionId(data.portalSessionId);
          setEnrollment(data.enrollment);
          setSemesters(semestersForUI);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error("Failed to restore session from localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Prefetch profile details when session is active
  useEffect(() => {
    async function loadProfile() {
      if (portalSessionId && !studentProfile) {
        try {
          const response = await fetch(
            `${API_BASE}/api/student/profile?portalSessionId=${encodeURIComponent(portalSessionId)}`
          );
          if (response.ok) {
            const data = await response.json();
            setStudentProfile(data);
          } else if (response.status === 440) {
            // Session expired
            logout();
          }
        } catch (err) {
          console.error("Failed to prefetch student profile:", err);
        }
      }
    }
    if (isAuthenticated) {
      loadProfile();
    }
  }, [portalSessionId, isAuthenticated, studentProfile]);

  const login = ({ portalSessionId: sessionId, semesters: sems, enrollment: enrollNum }) => {
    // Standardize original semesters format to save in localStorage
    const originalSemesters = sems.map(s => {
      const val = parseInt(s.value, 10);
      return {
        value: String(val),
        label: `Semester ${val}`,
      };
    }).filter(s => {
      const val = parseInt(s.value, 10);
      return !isNaN(val) && val >= 1 && val <= 8;
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ portalSessionId: sessionId, semesters: originalSemesters, enrollment: enrollNum })
    );

    // Compute semesters for UI including the next unreleased semester
    const semestersForUI = [...originalSemesters];
    if (semestersForUI.length > 0) {
      const maxSem = Math.max(...semestersForUI.map(s => parseInt(s.value, 10) || 0));
      const nextSem = maxSem + 1;
      if (nextSem <= 8 && !semestersForUI.some(s => parseInt(s.value, 10) === nextSem)) {
        semestersForUI.push({
          value: String(nextSem),
          label: `Semester ${nextSem}`,
        });
      }
    }

    setPortalSessionId(sessionId);
    setEnrollment(enrollNum);
    setSemesters(semestersForUI);
    setStudentProfile(null); // Clear previous student profile, will prefetch
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPortalSessionId("");
    setEnrollment("");
    setSemesters([]);
    setStudentProfile(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (profileData) => {
    setStudentProfile(profileData);
  };

  const value = {
    portalSessionId,
    enrollment,
    semesters,
    studentProfile,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
