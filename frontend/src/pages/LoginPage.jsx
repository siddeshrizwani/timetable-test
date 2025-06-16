// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- THIS IS THE FIX ---
  // Determine the redirect path. If the user was sent here from a protected
  // route, `location.state.from` will exist. Otherwise, default to the homepage.
  const from = location.state?.from?.pathname || "/";

  // Handles the email/password login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await login(email, password); // The login function from AuthContext

      // --- REDIRECT LOGIC ---
      // After a successful login, navigate based on role, but use 'from'
      // if it's a more specific path than the default dashboard.
      if (user.role === "admin" || user.role === "super") {
        navigate(from === "/" ? "/admin" : from, { replace: true });
      } else if (user.role === "faculty" || user.role === "user") {
        // also check for 'user' role
        navigate(from === "/" ? "/faculty" : from, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.message || "Failed to log in. Please check your credentials."
      );
      setLoading(false);
    }
  };

  // Handles the "Sign in with Google" button click
  const handleGoogleLogin = () => {
    // The backend will handle the redirect flow.
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Login to Your Account
        </h2>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative px-2 text-sm text-gray-600 bg-white">
            Or continue with
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <img
            className="w-5 h-5 mr-2"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
          />
          <span className="text-sm font-medium text-gray-700">
            Sign in with Google
          </span>
        </button>

        <div className="text-sm text-center text-gray-600">
          <Link to="/" className="font-medium text-indigo-600 hover:underline">
            &larr; Back to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
