// src/pages/AdminLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
// You'll need icons. For now, using text or simple SVGs.
// Consider a library like Heroicons: npm install @heroicons/react

// Placeholder icons (replace with actual SVGs or an icon library)
const DashboardIcon = () => <span className="w-5 h-5 mr-3"><img
                          src="/src/assets/icons/dashboard-monitor.png" 
                          alt="Settings"
                          className="w-5 h-5 inline"
                        /></span>;
const BatchesIcon = () => <span className="w-5 h-5 mr-3"><img 
                          src="/src/assets/icons/crowd2.png" 
                          alt="Settings"
                          className="w-5 h-5 inline"
                         /></span>;
const SubjectsIcon = () => <span className="w-5 h-5 mr-3"><img
                          src="/src/assets/icons/book.png" 
                          alt="Subject"
                          className="w-5 h-5 inline"
                        /></span>;
const SettingsIcon = () => <span className="w-5 h-5 mr-3"><img
                          src="/src/assets/icons/set.gif" 
                          alt="Settings"
                          className="w-5 h-5 inline"
                        /></span>;
const NotificationIcon = () => (
  <button className="w-8 h-8">
    <img 
      src="/src/assets/icons/bell.png"
      alt="Notifications"
      className="w-full h-full"
    />
  </button>
);

const UserAvatar = ({ user }) => (
  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
    {user?.email ? user.email.substring(0, 1).toUpperCase() : "U"}
  </div>
);

const AdminLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login"); // Redirect to login after logout
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
    }`;

  const sidebarContent = (
    <>
      <nav className="mt-6 space-y-2">
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
        { <NavLink to="/admin/settings" className={navLinkClasses}>
                    <SettingsIcon />
                    Settings
                </NavLink> }
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          {/* Adjusted the "Time Table" title placement based on designs showing it prominent */}
          <h1 className="text-2xl font-bold text-indigo-700">Time Table</h1>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">{sidebarContent}</div>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
          >
            <span className="mr-2"><img
                          src="/src/assets/icons/logout.svg" 
                          alt="Logout"
                          className="w-5 h-5 inline"
                        /></span> {/* Logout Icon Placeholder */}
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile and content header */}
        <header className="bg-white shadow-md md:shadow-none border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button & Title for mobile */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="mr-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
                <h1 className="text-xl font-bold text-indigo-700 md:hidden">
                  Time Table
                </h1>
              </div>

              {/* Placeholder for breadcrumbs or page title on larger screens */}
              <div className="hidden md:block">
                {/* This could be dynamic based on the current page */}
                {/* <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2> */}
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-1 rounded-full text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <NotificationIcon />
                </button>
                <UserAvatar user={user} />
              </div>
            </div>
          </div>
          {/* Mobile menu, show/hide based on menu state */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
                <NavLink
                  to="/admin/dashboard"
                  className={mobileNavLinkClasses}
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/batches"
                  className={mobileNavLinkClasses}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Batches
                </NavLink>
                <NavLink
                  to="/admin/subjects"
                  className={mobileNavLinkClasses}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Subjects
                </NavLink>
                {/* <NavLink to="/admin/settings" className={mobileNavLinkClasses} onClick={()=> setIsMobileMenuOpen(false)}>Settings</NavLink> */}
                <button
                  onClick={() => {
                    handleLogoutClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Page content rendered by Outlet */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet /> {/* Child routes will render here */}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
