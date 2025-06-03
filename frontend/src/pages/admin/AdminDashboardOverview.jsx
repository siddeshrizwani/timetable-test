// src/pages/admin/AdminDashboardOverview.jsx
import React from "react";
import { Link } from "react-router-dom";

// Placeholder Icon components (replace with actual SVGs or an icon library if desired)
const BatchesIcon = () => <span className="text-3xl">📚</span>;
const SubjectsIcon = () => <span className="text-3xl">📖</span>;
const SettingsIcon = () => <span className="text-3xl">⚙️</span>;

const AdminDashboardOverview = ({ user }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-lg text-slate-600">
          Welcome back, {user?.email || "Admin"}! Manage your university's
          timetable efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Link Card for Batches */}
        <Link
          to="/admin/batches"
          className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <BatchesIcon /> {/* Replace with actual icon */}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Manage Batches
              </h2>
              <p className="text-sm text-slate-500">
                View, create, and edit academic batches.
              </p>
            </div>
          </div>
        </Link>

        {/* Quick Link Card for Subjects */}
        <Link
          to="/admin/subjects"
          className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <SubjectsIcon /> {/* Replace with actual icon */}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Manage Subjects
              </h2>
              <p className="text-sm text-slate-500">
                Define courses, credits, and faculty assignments.
              </p>
            </div>
          </div>
        </Link>

        {/* Placeholder Card for Settings or other important links */}
        <div
          className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
          onClick={() => alert("Settings page placeholder")}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 rounded-full">
              <SettingsIcon /> {/* Replace with actual icon */}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                System Settings
              </h2>
              <p className="text-sm text-slate-500">
                Configure global parameters and preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* You can add more sections here like recent activity, alerts, etc. */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-3">
          System Status
        </h3>
        <p className="text-sm text-slate-600">
          All systems operational. Last timetable generated:{" "}
          {new Date().toLocaleDateString()}.
        </p>
        {/* Add more status indicators or quick stats */}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
