// src/pages/LoginPage.jsx
// Login page with role selection for Admin or Faculty.

import React, { useState } from "react";

const RoleLoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("faculty"); // Default role
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email/ID and password.");
      return;
    }
    console.log("Login attempt with:", { email, password, role });
    setTimeout(() => {
      onLogin({ email, role });
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Login as:
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="faculty"
              checked={role === "faculty"}
              onChange={() => setRole("faculty")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="ml-2 text-sm text-slate-800">Faculty</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="ml-2 text-sm text-slate-800">Admin</span>
          </label>
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Institutional ID / Email
        </label>
        <input
          type="text"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
          placeholder="your.id@institution.ac.in"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
          placeholder="••••••••"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate-800"
          >
            Remember me
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
      >
        Sign In
      </button>
    </form>
  );
};

const LoginPage = ({ onLoginSuccess }) => {
  const handleActualLogin = (loginData) => {
    console.log(
      "Login successful in LoginPage, calling onLoginSuccess with:",
      loginData
    );
    onLoginSuccess(loginData);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            University Timetable Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Sign in as Admin or Faculty
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10">
          <RoleLoginForm onLogin={handleActualLogin} />
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Timetable Project. For authorized
        personnel only.
      </p>
    </div>
  );
};

export default LoginPage;
