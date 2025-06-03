// src/App.jsx
// Main application component with role-based routing.

import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
} from "react-router-dom";

// --- Page Component Imports ---
import PublicHomePage from "./pages/PublicHomePage";
import LoginPage from "./pages/LoginPage";
// AdminLayout will serve as the main page for the /admin/* routes
import AdminLayout from "./pages/AdminLayout"; // Renamed from AdminDashboardPage for clarity
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import BatchesListPage from "./pages/admin/BatchesListPage";
import CreateBatchPage from "./pages/admin/CreateBatchPage";
import SubjectsListPage from "./pages/admin/SubjectsListPage";
import CreateSubjectPage from "./pages/admin/CreateSubjectPage";

import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [authDetails, setAuthDetails] = useState(null); // Stores { email, role }

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
        {" "}
        {/* Overall page background */}
        {/* Global Nav will be rendered if user is not in an admin/faculty specific layout */}
        {!isAuthenticated && ( // Example: Only show global nav if not logged in, or make it part of layouts
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
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors duration-150"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}
        <main className="flex-grow">
          {" "}
          {/* Main content area takes remaining space */}
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

            {/* Admin Nested Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout user={authDetails} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route
                path="dashboard"
                element={<AdminDashboardOverview user={authDetails} />}
              />{" "}
              {/* Default admin page */}
              <Route path="batches" element={<BatchesListPage />} />
              <Route path="batches/new" element={<CreateBatchPage />} />
              {/* Add edit batch route: <Route path="batches/edit/:batchId" element={<EditBatchPage />} /> */}
              <Route path="subjects" element={<SubjectsListPage />} />
              <Route path="subjects/new" element={<CreateSubjectPage />} />
              {/* Add edit subject route: <Route path="subjects/edit/:subjectId" element={<EditSubjectPage />} /> */}
              {/* <Route path="settings" element={<AdminSettingsPage />} /> */}
              <Route index element={<Navigate to="dashboard" replace />} />{" "}
              {/* Default to dashboard overview */}
            </Route>

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  {/* FacultyLayout could be used here if faculty also has complex layout */}
                  <FacultyDashboardPage
                    user={authDetails}
                    onLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {/* Global footer might be conditional or part of layouts too */}
        {!isAuthenticated && (
          <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              &copy; {new Date().getFullYear()} University Timetable Project.
            </div>
          </footer>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
