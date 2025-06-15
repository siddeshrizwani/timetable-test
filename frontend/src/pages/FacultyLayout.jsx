// src/pages/FacultyLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

// Placeholder Icons
const ScheduleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 mr-3"
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
    className="h-6 w-6 mr-3"
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
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);
const UserAvatar = ({ user }) => (
  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
    {user?.email ? user.email.substring(0, 1).toUpperCase() : "F"}
  </div>
);

const FacultyLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
    }`;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-blue-700">Faculty Portal</h1>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          <nav className="mt-6 space-y-2">
            <NavLink to="/faculty/dashboard" className={navLinkClasses} end>
              <ScheduleIcon />
              My Dashboard
            </NavLink>
            <NavLink to="/faculty/profile" className={navLinkClasses}>
              <ProfileIcon />
              My Profile
            </NavLink>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button can be added here if needed */}
              <div className="text-xl font-semibold text-slate-800">
                Welcome, {user?.email || "Faculty"}
              </div>
              <UserAvatar user={user} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
