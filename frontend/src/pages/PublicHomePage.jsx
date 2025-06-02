// src/pages/PublicHomePage.jsx
// Improved styling for a more engaging and professional public home page.

import React from "react";
import { Link } from "react-router-dom";

const PublicHomePage = () => (
  <div className=" min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 lg:px-8">
    {/* Optional: University/Project Logo */}
    {/* <img src="/university-logo.png" alt="University Logo" className="w-24 h-24 mb-8" /> */}

    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0A1128] mb-6 leading-tight">
        University Timetable Automation
      </h1>
      <p className="text-lg sm:text-xl text-slate-700 mb-10">
        Streamlining academic scheduling for enhanced efficiency and a better
        learning experience. Access your schedules and management tools by
        logging in.
      </p>
    </div>

    <div className="bg-[#FEFCFB] p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-lg">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#001F54] mb-6">
        Welcome, Admin & Faculty
      </h2>
      <p className="text-slate-600 mb-8">
        Please select your portal to proceed. This system is designed to
        generate conflict-free, optimized schedules.
      </p>
      <div className="space-y-5">
        <Link
          to="/login" // This will lead to the page where they select role and log in
          className="block w-full bg-[#034078] hover:bg-[#001F54] text-white font-semibold py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-[#034078] focus:ring-offset-2 focus:ring-offset-[#FEFCFB]"
        >
          Proceed to Login
        </Link>
      </div>
    </div>

    <p className="mt-12 text-sm text-slate-500">
      Leveraging advanced optimization to simplify complex scheduling.
    </p>
  </div>
);

export default PublicHomePage;
