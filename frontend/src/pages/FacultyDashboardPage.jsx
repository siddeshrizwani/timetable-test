// src/pages/FacultyDashboardPage.jsx

import React from "react";

const FacultyDashboardPage = ({ user }) => (
  <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
    <div className="mb-8 pb-4 border-b border-slate-200">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
        Faculty Dashboard
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Welcome, Faculty {user?.email || "User"}! View your schedule and course
        information.
      </p>
    </div>
    {/* Add Faculty-specific content and components here */}
    <p>
      Your teaching schedule, assigned courses, and student lists will be
      accessible here.
    </p>
    <div className="mt-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        Your Upcoming Classes
      </h3>
      <ul className="space-y-3 text-slate-700">
        <li className="flex justify-between p-3 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
          <span>Advanced Algorithms</span>
          <span className="font-medium text-indigo-600">
            Mon, 10:00 AM - CS 301
          </span>
        </li>
        <li className="flex justify-between p-3 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
          <span>Data Structures Lab</span>
          <span className="font-medium text-indigo-600">
            Wed, 2:00 PM - Lab 3
          </span>
        </li>
      </ul>
      <p className="mt-4 text-sm text-slate-500">
        No more classes scheduled for today.
      </p>
    </div>
  </div>
);

export default FacultyDashboardPage;
