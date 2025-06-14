// src/pages/AdminLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

// SVG Icon Components for better visuals
const DashboardIcon = () => (
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
      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const BatchesIcon = () => (
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
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const SubjectsIcon = () => (
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
const TeachersIcon = () => (
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
const RoomsIcon = () => (
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
      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
    />
  </svg>
);
const TimetableIcon = () => (
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
const UserAvatar = ({ user }) => (
  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
    {user?.email ? user.email.substring(0, 1).toUpperCase() : "A"}
  </div>
);

const AdminLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? "bg-indigo-600 text-white shadow"
        : "text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-lg">
        <div className="px-6 py-5 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-indigo-700">Time Table</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClasses} end>
            <DashboardIcon />
            Dashboard
          </NavLink>
          <NavLink to="/admin/batches" className={navLinkClasses}>
            <BatchesIcon />
            Batches
          </NavLink>
          <NavLink to="/admin/subjects" className={navLinkClasses}>
            <SubjectsIcon />
            Subjects
          </NavLink>
          <NavLink to="/admin/teachers" className={navLinkClasses}>
            <TeachersIcon />
            Teachers
          </NavLink>
          <NavLink to="/admin/rooms" className={navLinkClasses}>
            <RoomsIcon />
            Rooms
          </NavLink>
          <NavLink to="/admin/timetable" className={navLinkClasses}>
            <TimetableIcon />
            View Timetable
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8">
          <UserAvatar user={user} />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
