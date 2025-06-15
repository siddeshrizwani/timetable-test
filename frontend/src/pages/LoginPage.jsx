// src/pages/LoginPage.jsx
import React, { useState } from "react";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both your email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // FIX #1: Sending `email` instead of `username`.
        // The `role` is no longer needed here; the backend determines it.
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        if (data && data.accessToken && data.role) {
          // FIX #2: Using the `role` from the server's response.
          // This is more secure and reliable.
          onLoginSuccess({ token: data.accessToken, role: data.role });
        } else {
          setError("Login successful but token or role not received.");
        }
      } else {
        setError(data?.msg || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Login request failed:", err);
      setError(
        "Failed to connect to the server. Please check your connection."
      );
    }
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

      {/* The role selector has been removed as it's now handled by the backend */}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Institutional Email
        </label>
        <input
          type="email" // Changed type to email for better validation
          id="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
          placeholder="your.email@university.com"
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
};

const LoginPage = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            University Timetable Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Sign in with your institutional credentials.
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10">
          <LoginForm onLoginSuccess={onLoginSuccess} />
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
