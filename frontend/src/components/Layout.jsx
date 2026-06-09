import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ShieldCheck,
  HelpCircle,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Avatar({ text, src, className }) {
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
  }, [src]);
  return (
    <div className={`relative flex items-center justify-center rounded-full border border-white/10 bg-[#1F2937] text-xs font-bold text-white overflow-hidden shrink-0 ${className}`}>
      {src && !error ? (
        <img
          src={src}
          alt="Avatar"
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}

export default function Layout() {
  const { isAuthenticated, studentProfile, enrollment, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const studentName = studentProfile?.studentName || "";
  const enrollmentNo = studentProfile?.enrollmentNo || enrollment || "";
  const photoUrl = studentProfile?.photoUrl || "";

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(studentName);

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-white flex flex-col font-sans select-none">
      
      {/* ─── Transparent Navbar Header ─── */}
      <header
        className={
          pathname === "/"
            ? "fixed top-0 left-0 right-0 z-50 w-full border-b border-transparent bg-transparent select-none no-print transition-all duration-300"
            : "sticky top-0 z-40 w-full border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md select-none no-print transition-all duration-300"
        }
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left: Brand */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white shadow-soft">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-extrabold tracking-tight text-white sm:text-base">
                    IPUNex Results
                  </span>
                  <span className="hidden rounded-full bg-[#06B6D4]/15 px-2 py-0.5 text-[9px] font-bold text-cyan-light border border-[#06B6D4]/20 sm:inline-block">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400">
                  Academic Performance Dashboard
                </p>
              </div>
            </Link>

            {/* Center: Navigation Links */}
            <nav className="hidden md:flex h-full items-stretch gap-10 text-xs font-bold uppercase tracking-wider text-slate-400">
              <div className="relative flex h-full items-center">
                <Link
                  to="/about"
                  className={`transition duration-200 hover:text-white ${
                    pathname === "/about" ? "text-white" : "text-slate-400"
                  }`}
                >
                  Why IPUNex
                </Link>
                {pathname === "/about" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <div className="relative flex h-full items-center">
                <Link
                  to="/services"
                  className={`transition duration-200 hover:text-white ${
                    pathname === "/services" ? "text-white" : "text-slate-400"
                  }`}
                >
                  Services
                </Link>
                {pathname === "/services" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <div className="relative flex h-full items-center">
                <Link
                  to="/security"
                  className={`transition duration-200 hover:text-white ${
                    pathname === "/security" ? "text-white" : "text-slate-400"
                  }`}
                >
                  Security
                </Link>
                {pathname === "/security" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <div className="relative flex h-full items-center">
                <Link
                  to="/resources"
                  className={`transition duration-200 hover:text-white ${
                    pathname === "/resources" ? "text-white" : "text-slate-400"
                  }`}
                >
                  Resources
                </Link>
                {pathname === "/resources" && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              {isAuthenticated && (
                <>
                  <div className="relative flex h-full items-center">
                    <Link
                      to="/internal-marks"
                      className={`transition duration-200 hover:text-white ${
                        pathname === "/internal-marks" ? "text-white" : "text-slate-400"
                      }`}
                    >
                      Internal Marks
                    </Link>
                    {pathname === "/internal-marks" && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                  <div className="relative flex h-full items-center">
                    <Link
                      to="/results"
                      className={`transition duration-200 hover:text-white ${
                        pathname === "/results" ? "text-white" : "text-slate-400"
                      }`}
                    >
                      Results
                    </Link>
                    {pathname === "/results" && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                </>
              )}
            </nav>

            {/* Right: Actions / Profile */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-[#111827] p-1.5 pr-3 text-left outline-none transition hover:bg-zinc-800 hover:border-white/10"
                  >
                    <Avatar text={initials} src={photoUrl} className="h-7 w-7 sm:h-8 sm:w-8" />
                    <div className="hidden text-left sm:block">
                      <p className="max-w-[120px] truncate text-xs font-bold text-white leading-tight">
                        {studentName || "Student"}
                      </p>
                      <p className="text-[9px] font-medium text-slate-400 tracking-wide mt-0.5">
                        {enrollmentNo}
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] px-4 py-2 text-xs font-bold text-white shadow-glow hover:brightness-110 transition"
                >
                  Check Results
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-[#111827] text-slate-300 md:hidden outline-none hover:bg-zinc-800"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu Drawer ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/5 bg-[#09090B] z-30 select-none overflow-hidden no-print"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/about" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Why IPUNex</Link>
              <Link to="/services" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Services</Link>
              <Link to="/security" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Security</Link>
              <Link to="/resources" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Resources</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/internal-marks" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Internal Marks</Link>
                  <Link to="/results" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Results</Link>
                  <Link to="/profile" className="block text-xs font-bold uppercase tracking-wider text-slate-300 py-2">Student Profile</Link>
                  <button
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-center rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] py-2 text-xs font-bold text-white shadow-glow"
                >
                  Check Results
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Profile Dropdown Menu / Bottom Sheet (Desktop/Mobile overlay) ─── */}
      <AnimatePresence>
        {isDropdownOpen && isAuthenticated && (
          <>
            {/* Mobile Bottom Sheet Overlay & Drawer */}
            <div className="sm:hidden no-print">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsDropdownOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 rounded-t-2xl border-t border-white/10 bg-[#111827] p-5 shadow-2xl z-50 space-y-4 pb-8"
              >
                <div className="h-1 w-12 bg-zinc-800 rounded-full mx-auto mb-2" />
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Avatar text={initials} src={photoUrl} className="h-12 w-12" />
                  <div>
                    <p className="font-bold text-white text-base leading-tight">{studentName || "Student"}</p>
                    <p className="text-xs text-slate-400 mt-1">{enrollmentNo}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-zinc-800 transition text-left"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Student Profile
                  </Link>
                  <button
                    disabled
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed transition text-left"
                  >
                    <Settings className="h-4 w-4 text-slate-600" />
                    Account Settings (Future Ready)
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogoutClick();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition text-left"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Desktop Dropdown */}
            <div className="hidden sm:block no-print">
              <div className="fixed inset-0 z-45" onClick={() => setIsDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-4 md:right-8 lg:right-12 mt-2 w-56 rounded-xl border border-white/10 bg-[#111827] shadow-xl p-1 z-50 font-sans"
              >
                <div className="px-3 py-2 border-b border-white/5 mb-1 text-left">
                  <p className="font-bold text-white text-xs truncate leading-tight">{studentName || "Student"}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{enrollmentNo}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-zinc-800 transition text-left"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Student Profile
                </Link>
                <button
                  disabled
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed transition text-left"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-600" />
                  Account Settings (Future)
                </button>
                <div className="border-t border-white/5 my-1" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogoutClick();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition text-left"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-400" />
                  Logout
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content Container ─── */}
      <main className={`flex-1 w-full relative z-10 ${pathname === "/" ? "" : "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"}`}>
        <Outlet />
      </main>

      {/* ─── Unified Footer ─── */}
      <footer className="relative border-t border-white/5 bg-[#09090b] py-12 select-none no-print mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 pb-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white shadow-glow">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-heading text-sm font-black uppercase tracking-wider text-white">IPUNex</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-navy-450">
                A premium, modern dashboard environment interface built to render student assessments and academic reports elegantly.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-xs text-navy-400">
                <li><Link to="/about" className="hover:text-cyan-light transition">Why IPUNex</Link></li>
                <li><Link to="/services" className="hover:text-cyan-light transition">Portal Services</Link></li>
                <li><Link to="/security" className="hover:text-cyan-light transition">Security & Trust</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Services</h4>
              <ul className="mt-4 space-y-2 text-xs text-navy-400">
                <li><Link to="/internal-marks" className="hover:text-cyan-light transition">Internal Marks Check</Link></li>
                <li><Link to="/results" className="hover:text-cyan-light transition">Semester Result Login</Link></li>
                <li><Link to="/resources" className="hover:text-cyan-light transition">Resource Catalog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Academic System</h4>
              <ul className="mt-4 space-y-2 text-xs text-navy-400">
                <li>Guru Gobind Singh Indraprastha University</li>
                <li>Dwarka, New Delhi</li>
                <li>Student Search Portal Integration</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-navy-500">
            <p>&copy; {new Date().getFullYear()} IPUNex. Built independently for the GGSIPU academic community.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-cyan-light transition">Privacy Policy</span>
              <span className="cursor-pointer hover:text-cyan-light transition">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
