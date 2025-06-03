// src/App.jsx
// Main application component with role-based routing.
// Page components are now correctly imported.

import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// --- Page Component Imports ---
// Ensure these files exist in 'src/pages/' and contain the styled versions
import PublicHomePage from "./pages/PublicHomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [authDetails, setAuthDetails] = useState(null);

  const handleLoginSuccess = (loginData) => {
    console.log("Login successful in App.jsx with:", loginData);
    setAuthDetails(loginData);
  };

  const handleLogout = () => {
    console.log("Logout triggered in App.jsx");
    setAuthDetails(null);
  };

  const isAuthenticated = !!authDetails;
  const userRole = authDetails?.role;

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.warn(
        `User with role "${userRole}" tried to access a route for roles: ${allowedRoles.join(
          ", "
        )}`
      );
      return <Navigate to="/" replace />; // Or an "Access Denied" page
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-100">
        <nav className="bg-slate-900 text-slate-200 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                to="/"
                className="font-bold text-xl hover:text-white transition-colors duration-150"
              >
                Timetable Portal
              </Link>
              <div className="flex items-center space-x-3 sm:space-x-4">
                {isAuthenticated && userRole === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors duration-150"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {isAuthenticated && userRole === "faculty" && (
                  <Link
                    to="/faculty/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors duration-150"
                  >
                    Faculty Dashboard
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors duration-150"
                  >
                    Login
                  </Link>
                )}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<PublicHomePage />} />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    userRole === "admin" ? (
                      <Navigate to="/admin/dashboard" replace />
                    ) : userRole === "faculty" ? (
                      <Navigate to="/faculty/dashboard" replace />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  ) : (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                  )
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboardPage user={authDetails} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["faculty"]}>
                    <FacultyDashboardPage user={authDetails} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>

        <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            &copy; {new Date().getFullYear()} University Timetable Project.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
