import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const TeachersListPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/api/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch teachers.");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Teachers Management
          </h1>
          <p className="mt-1 text-slate-600">
            Add, view, and manage all faculty members.
          </p>
        </div>
        <Link to="/admin/teachers/new" className="btn btn-primary">
          Add Teacher
        </Link>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Teacher Name</th>
                <th className="th">Email</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="td text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="hover:bg-slate-50">
                    <td className="td font-medium">{teacher.name}</td>
                    <td className="td">{teacher.email}</td>
                    <td className="td">
                      <div className="flex items-center space-x-2">
                        {/* Edit/Delete buttons would go here */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachersListPage;
