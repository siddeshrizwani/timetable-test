// src/pages/admin/SubjectDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/subjects/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ msg: "Failed to fetch subject details." }));
          throw new Error(errData.msg);
        }
        const data = await response.json();
        setSubject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  if (isLoading) {
    return <div className="text-center p-10">Loading subject details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!subject) {
    return <div className="text-center p-10">Subject not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/admin/subjects"
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
          Back to Subjects List
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          {subject.name}
        </h1>
        <p className="text-lg text-slate-500 font-mono">{subject.code}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">
          Credit Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Lecture Credits
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">
              {subject.lecture_credits}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Lab/Practical Credits
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">
              {subject.lab_credits}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Total Credits
            </dt>
            <dd className="mt-1 text-2xl font-bold text-indigo-600">
              {subject.lecture_credits + subject.lab_credits}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailPage;
