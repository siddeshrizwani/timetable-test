// frontend/src/pages/FacultyLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // --- FIX: Import the useAuth hook ---

// --- EXISTING CODE: Your SVG Icon components (no changes needed here) ---
const ScheduleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const CoursesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);
const UserAvatar = ({ user }) => (
  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
    {user?.email ? user.email.substring(0, 1).toUpperCase() : "F"}
  </div>
);

// --- UPDATED COMPONENT ---
const FacultyLayout = () => {
  // --- FIX: Get user and logout function directly from AuthContext ---
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- FIX: This handler now calls the 'logout' function from context ---
  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? "bg-blue-600 text-white shadow"
        : "text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg">
        <div className="px-6 py-5 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-blue-700">Faculty Portal</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <NavLink to="/faculty/dashboard" className={navLinkClasses} end>
            <ScheduleIcon />
            My Dashboard
          </NavLink>
          <NavLink to="/faculty/courses" className={navLinkClasses}>
            <CoursesIcon />
            My Courses
          </NavLink>
          <NavLink to="/faculty/profile" className={navLinkClasses}>
            <ProfileIcon />
            My Profile
          </NavLink>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogoutClick}
            className="w-full btn btn-danger flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {/* --- FIX: Use user object from context --- */}
            Welcome, {user?.username || user?.email || "Faculty"}
          </h2>
          {/* --- FIX: Use user object from context --- */}
          <UserAvatar user={user} />
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {/* --- FIX: Outlet no longer needs context passed this way --- */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default FacultyLayout;
