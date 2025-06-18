import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import eye2 from "../../assets/icons/eye2.svg";
import pencil from "../../assets/icons/pencil.svg";
import trash2 from "../../assets/icons/trash-2.svg";

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    ></path>
  </svg>
);
const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const SubjectsListPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:3000/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch subjects.");
      const data = await response.json();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    const results = subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(results);
  }, [searchTerm, subjects]);

  const handleDelete = async (subjectId, subjectName) => {
    if (window.confirm(`Are you sure you want to delete "${subjectName}"?`)) {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/subjects/${subjectId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || "Failed to delete subject.");
        }
        alert("Subject deleted successfully!");
        fetchSubjects();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Subjects Management
          </h1>
          <p className="mt-1 text-slate-600">
            View, create, and manage all academic subjects.
          </p>
        </div>
        <Link to="/admin/subjects/new" className="btn btn-primary">
          Create Subject
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <div className="relative sm:max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <button
          onClick={fetchSubjects}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshIcon />
          Refresh
        </button>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Subject Name</th>
                <th className="th">Code</th>
                <th className="th">Lecture Credits</th>
                <th className="th">Lab Credits</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="td text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="td text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.subject_id} className="hover:bg-slate-50">
                    <td className="td font-medium">{subject.name}</td>
                    <td className="td">{subject.code}</td>
                    <td className="td">{subject.lecture_credits}</td>
                    <td className="td">{subject.lab_credits}</td>
                    <td className="td">
                      {/* FIX: Icons are now in a flex container for alignment */}
                      <div className="flex items-center space-x-2">
                        {/* NEW: Added View icon link */}
                        <Link
                          to={`/admin/subjects/${subject.subject_id}`}
                          title="View Details"
                          className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition"
                        >
                          <img
                            src={eye2}
                            alt="View"
                            className="w-5 h-5"
                          />
                        </Link>
                        <Link
                          to={`/admin/subjects/edit/${subject.subject_id}`}
                          title="Edit"
                          className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-sky-50 transition"
                        >
                          <img
                            src={pencil}
                            alt="Edit"
                            className="w-5 h-5"
                          />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(subject.subject_id, subject.name)
                          }
                          title="Delete"
                          className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 transition"
                        >
                          <img
                            src={trash2}
                            alt="Delete"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="td text-center">
                    No subjects found.
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

export default SubjectsListPage;
