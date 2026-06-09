import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Loader2 } from "lucide-react";

// Lazy loaded page components
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const ResultsDashboardPage = lazy(() => import("./pages/ResultsDashboardPage.jsx"));
const InternalMarksDashboardPage = lazy(() => import("./pages/InternalMarksDashboardPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const SecurityPage = lazy(() => import("./pages/SecurityPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.jsx"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage.jsx"));

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-light" />
        <p className="text-sm font-semibold tracking-wide text-navy-300">
          Loading page assets...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/internal-marks"
                element={
                  <ProtectedRoute>
                    <InternalMarksDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <ResultsDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

