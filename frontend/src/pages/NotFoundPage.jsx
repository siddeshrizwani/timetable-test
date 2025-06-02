// src/pages/NotFoundPage.jsx
// Enhanced styling for the 404 page.

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 lg:px-8">
    <svg
      className="w-32 h-32 sm:w-48 sm:h-48 mb-8 text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <h1 className="text-5xl sm:text-6xl font-extrabold text-red-600 mb-4">
      404
    </h1>
    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6">
      Oops! Page Not Found.
    </h2>
    <p className="text-slate-600 mb-10 max-w-md text-lg">
      The page you are looking for might have been removed, had its name
      changed, or is temporarily unavailable. Please check the URL or head back
      home.
    </p>
    <Link
      to="/"
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Go Back to Homepage
    </Link>
  </div>
);

export default NotFoundPage;
