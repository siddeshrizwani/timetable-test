// src/pages/AuthCallbackPage.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const AuthCallbackPage = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token && role) {
      // If we have a token and role, the login was successful.
      // Call the main login handler in App.jsx to update the app's state.
      onLoginSuccess({ token, role });

      // Redirect to the appropriate dashboard.
      // The Navigate component in App.jsx will handle this automatically,
      // but we can also push it here for a faster redirect.
      if (role === "admin" || role === "super") {
        navigate("/admin/dashboard");
      } else {
        navigate("/faculty/dashboard");
      }
    } else {
      // If there's no token, the login failed. Redirect back to the login page with an error.
      navigate("/login?error=auth_failed");
    }
  }, [onLoginSuccess, searchParams, navigate]);

  // Display a loading message while the redirect is processed.
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-700">
          Authenticating...
        </h1>
        <p className="text-slate-500 mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
