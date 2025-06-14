// src/pages/faculty/FacultyProfilePage.jsx
import React from "react";

const FacultyProfilePage = () => {
  // In a real application, this data would be fetched from an API
  const user = {
    name: "Professor Davis",
    email: "prof.davis@university.com",
    department: "Computer Science",
    phone: "123-456-7890",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="mt-1 text-slate-600">
          View and manage your personal information.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-500">
              Full Name
            </label>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {user.name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">
              Email Address
            </label>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {user.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">
              Department
            </label>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {user.department}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">
              Contact Number
            </label>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {user.phone}
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex justify-end">
          <button className="btn btn-primary">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

// This line ensures the component can be imported correctly in other files.
export default FacultyProfilePage;
