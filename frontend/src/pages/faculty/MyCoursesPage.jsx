// src/pages/faculty/MyCoursesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          "/api/faculty/my-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch courses.");
        setCourses(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (isLoading) return <p>Loading your courses...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">My Assigned Courses</h1>
      <p className="text-slate-600">
        A list of all unique subjects you teach across various batches.
      </p>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Subject</th>
              <th className="th">Batch</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {courses.map((course) => (
              <tr key={`${course.subject_id}-${course.batch_id}`}>
                <td className="td font-medium">
                  {course.subject_name} ({course.subject_code})
                </td>
                <td className="td">{course.batch_name}</td>
                <td className="td">
                  <Link
                    to={`/faculty/courses/${course.batch_id}`}
                    className="btn btn-sm btn-secondary"
                  >
                    View Student List
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyCoursesPage;
