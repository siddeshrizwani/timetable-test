// src/pages/AdminDashboardPage.jsx

import React from "react";

const AdminDashboardPage = ({ user }) => (
  <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
    <div className="mb-8 pb-4 border-b border-slate-200">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Welcome, Admin {user?.email || "User"}! Manage university timetables and
        resources.
      </p>
    </div>
    {/* Add Admin-specific content and components here */}
    <p>
      Admin tools for timetable generation, batch management, faculty
      assignments, etc., will go here.
    </p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Manage Batches
        </h3>
        <p className="text-sm text-slate-600">
          Create, update, or delete academic batches and assign courses.
        </p>
      </div>
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Generate Timetables
        </h3>
        <p className="text-sm text-slate-600">
          Access the scheduling engine to automatically generate class
          timetables.
        </p>
      </div>
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Faculty Management
        </h3>
        <p className="text-sm text-slate-600">
          View and manage faculty details, availability, and subject
          assignments.
        </p>
      </div>
    </div>
  </div>
);

export default AdminDashboardPage;
