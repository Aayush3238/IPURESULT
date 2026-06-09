import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Award,
  Calendar,
  BookOpen,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Building,
  Heart,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function StudentProfileCard({ portalSessionId, apiBase = "", isDrawer = false }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProfile() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${apiBase}/api/student/profile?portalSessionId=${encodeURIComponent(portalSessionId)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || "Failed to load student profile.");
      }

      setProfile(data);
    } catch (err) {
      console.error("[profile:fetch] error:", err);
      setError(err.message || "An unexpected error occurred while fetching your profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (portalSessionId) {
      fetchProfile();
    }
  }, [portalSessionId]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass border-error/20 rounded-2xl p-6 text-center max-w-lg mx-auto"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/15 text-error-light mx-auto mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-lg font-bold text-white mb-2">Failed to Load Profile</h3>
        <p className="text-sm text-navy-200 mb-6">{error}</p>
        <button
          type="button"
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:from-accent-hover hover:to-cyan-hover transition duration-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!profile) return null;

  // Format fallbacks
  const name = profile.studentName || "Student Profile";
  const rollNo = profile.enrollmentNo || "N/A";
  const photoUrl = profile.photoUrl || "";
  const program = profile.program || "N/A";
  const institute = profile.institute || "N/A";
  const admissionYear = profile.admissionYear || "N/A";
  const batch = profile.batch || "N/A";
  const fatherName = profile.fatherName || "N/A";
  const motherName = profile.motherName || "N/A";
  const email = profile.email || "N/A";
  const contact = profile.contactNumber || "N/A";
  const gender = profile.gender || "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`space-y-6 ${isDrawer ? "max-w-full" : "max-w-5xl mx-auto"}`}
    >
      {/* Premium Profile Header Card */}
      <div className="glass overflow-hidden rounded-2xl shadow-card border border-navy-600/50 relative">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, var(--color-accent-light) 0%, transparent 60%)",
          }}
        />
        <div className={`flex flex-col ${isDrawer ? "items-center text-center p-4 gap-4" : "md:flex-row gap-6 p-6 items-center md:items-start text-center md:text-left"} relative z-10`}>
          {/* Avatar Container with Neon border */}
          <div className="relative flex-none">
            <div className={`rounded-full overflow-hidden border-2 border-accent bg-navy-800/80 flex items-center justify-center neon-glow-blue ${isDrawer ? "h-20 w-20" : "h-28 w-28"}`}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Falls back to user icon on error
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{ display: photoUrl ? "none" : "flex" }}
                className="h-full w-full items-center justify-center bg-navy-800"
              >
                <User className={`${isDrawer ? "h-10 w-10" : "h-14 w-14"} text-navy-400`} />
              </div>
            </div>
            {gender && (
              <span className="absolute bottom-1 right-1 bg-accent rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md">
                {gender}
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className={`min-w-0 flex-1 space-y-1.5 ${isDrawer ? "text-center" : "text-center md:text-left"}`}>
            <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight truncate">
              {name}
            </h1>
            <p className="font-mono text-xs md:text-sm font-bold text-accent-light tracking-wide">{rollNo}</p>
            
            <div className={`flex flex-wrap items-center justify-center ${isDrawer ? "justify-center" : "md:justify-start"} gap-3 mt-4 pt-1.5 border-t border-navy-600/40`}>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800/80 px-2.5 py-1 text-xs font-semibold text-navy-100 border border-navy-700/50">
                <Calendar className="h-3.5 w-3.5 text-cyan-light" />
                Adm Year: {admissionYear}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800/80 px-2.5 py-1 text-xs font-semibold text-navy-100 border border-navy-700/50">
                <Award className="h-3.5 w-3.5 text-cyan-light" />
                Batch: {batch}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className={`grid gap-6 ${isDrawer ? "grid-cols-1" : "md:grid-cols-2"}`}>
        {/* Academic Details */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="glass rounded-2xl p-6 shadow-card border border-navy-600/50 space-y-5"
        >
          <h2 className="font-heading text-base font-bold text-white border-b border-navy-600/40 pb-3 flex items-center gap-2">
            <Building className="h-5 w-5 text-accent-light" />
            Academic Details
          </h2>

          <div className="space-y-4">
            <DetailItem
              icon={BookOpen}
              label="Program / Branch"
              value={program}
            />
            <DetailItem
              icon={Building}
              label="Institute / College"
              value={institute}
            />
          </div>
        </motion.div>

        {/* Contact & Family details */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="glass rounded-2xl p-6 shadow-card border border-navy-600/50 space-y-5"
        >
          <h2 className="font-heading text-base font-bold text-white border-b border-navy-600/40 pb-3 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-cyan-light" />
            Personal & Contact Details
          </h2>

          <div className="grid gap-4">
            <div className={`grid gap-4 ${isDrawer ? "grid-cols-1" : "grid-cols-2"}`}>
              <DetailItem
                icon={User}
                label="Father's Name"
                value={fatherName}
              />
              <DetailItem
                icon={Heart}
                label="Mother's Name"
                value={motherName}
              />
            </div>
            
            <div className="border-t border-navy-600/30 pt-3 mt-1 space-y-4">
              <DetailItem
                icon={Mail}
                label="Email Address"
                value={email}
                copyable
              />
              <DetailItem
                icon={Phone}
                label="Contact Number"
                value={contact}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DetailItem({ icon: Icon, label, value, copyable }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!value || value === "N/A") return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex-none flex h-7 w-7 items-center justify-center rounded-lg bg-navy-800/80 border border-navy-700/50 text-navy-300">
          <Icon className="h-4 w-4" />
        </div>
        <p
          className={`font-semibold text-sm text-white truncate flex-1 ${
            copyable && value !== "N/A" ? "cursor-pointer hover:text-accent-light" : ""
          }`}
          onClick={copyable ? handleCopy : undefined}
          title={copyable ? "Click to copy" : undefined}
        >
          {value}
        </p>
        {copyable && value !== "N/A" && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-[10px] text-navy-400 hover:text-white bg-navy-800/40 hover:bg-navy-800/80 border border-navy-700/50 px-2 py-0.5 rounded transition"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="glass rounded-2xl p-6 border border-navy-600/50 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="h-28 w-28 rounded-full skeleton flex-none" />
        <div className="space-y-3 flex-1 w-full md:w-auto text-center md:text-left mt-2">
          <div className="h-7 w-48 skeleton mx-auto md:mx-0" />
          <div className="h-4 w-32 skeleton mx-auto md:mx-0" />
          <div className="flex gap-3 justify-center md:justify-start pt-3 border-t border-navy-600/40 mt-4">
            <div className="h-6 w-28 skeleton" />
            <div className="h-6 w-28 skeleton" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6 border border-navy-600/50 space-y-6">
          <div className="h-6 w-36 skeleton" />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-9 w-full skeleton" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-9 w-full skeleton" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-navy-600/50 space-y-6">
          <div className="h-6 w-48 skeleton" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-9 w-full skeleton" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-9 w-full skeleton" />
            </div>
          </div>
          <div className="border-t border-navy-600/30 pt-4 space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-9 w-full skeleton" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 skeleton" />
              <div className="h-9 w-full skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
