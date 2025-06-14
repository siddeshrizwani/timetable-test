// src/pages/admin/BatchDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const BatchDetailPage = () => {
  const { batchId } = useParams(); // Get the batchId from the URL
  const [batchDetails, setBatchDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/batches/${batchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch batch details.");
        }
        const data = await response.json();
        setBatchDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchDetails();
  }, [batchId]);

  if (isLoading) {
    return <div className="text-center p-10">Loading batch details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!batchDetails) {
    return <div className="text-center p-10">Batch not found.</div>;
  }

  const totalCredits = batchDetails.subjects.reduce(
    (acc, subject) => acc + subject.lecture_credits + subject.lab_credits,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/admin/batches"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Batches List
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          {batchDetails.name}
        </h1>
      </div>

      {/* FIX: Info cards are now properly styled */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Department
          </h3>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {batchDetails.department}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Academic Year
          </h3>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {batchDetails.academic_year}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Current Semester
          </h3>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {batchDetails.semester_number}
          </p>
        </div>
      </div>

      {/* FIX: Assigned Subjects table is now properly styled */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Assigned Subjects
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Total Credits for this Semester:{" "}
            <span className="font-bold text-indigo-600">{totalCredits}</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Subject Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Lecture Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Lab Credits
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {batchDetails.subjects && batchDetails.subjects.length > 0 ? (
                batchDetails.subjects.map((subject) => (
                  <tr key={subject.subject_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {subject.lecture_credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {subject.lab_credits}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-slate-500"
                  >
                    No subjects have been assigned to this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailPage;
