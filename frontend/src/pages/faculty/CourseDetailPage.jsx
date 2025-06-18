// src/pages/faculty/CourseDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const CourseDetailPage = () => {
  const { batchId } = useParams();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `/api/faculty/batch/${batchId}/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch students.");
        setStudents(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [batchId]);

  if (isLoading) return <p>Loading students...</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/faculty/courses" className="text-sm btn btn-secondary">
          &larr; Back to My Courses
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">
          Enrolled Students
        </h1>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Roll Number</th>
              <th className="th">Student Name</th>
              <th className="th">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student.student_id}>
                  <td className="td font-mono">{student.roll_number}</td>
                  <td className="td font-medium">{student.name}</td>
                  <td className="td">{student.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="td text-center">
                  No students enrolled.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseDetailPage;
