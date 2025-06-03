// src/pages/admin/SubjectsListPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

// Placeholder Search Icon
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    ></path>
  </svg>
);

// Placeholder data - replace with data fetched from your API
const initialSubjects = [
  {
    id: "s1",
    name: "Introduction to Programming",
    code: "CS101",
    credits: 3,
    has_practical: true,
  },
  {
    id: "s2",
    name: "Calculus I",
    code: "MA101",
    credits: 4,
    has_practical: false,
  },
  {
    id: "s3",
    name: "Digital Logic Design",
    code: "EC102",
    credits: 3,
    has_practical: true,
  },
  {
    id: "s4",
    name: "Engineering Physics",
    code: "PH102",
    credits: 4,
    has_practical: true,
  },
  {
    id: "s5",
    name: "Communication Skills",
    code: "HS101",
    credits: 2,
    has_practical: false,
  },
];

const SubjectsListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState(initialSubjects);

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setSubjects(initialSubjects);
    } else {
      setSubjects(
        initialSubjects.filter(
          (subject) =>
            subject.name.toLowerCase().includes(term) ||
            subject.code.toLowerCase().includes(term)
        )
      );
    }
  };

  const handleViewSubject = (subjectId) => {
    alert(`View subject with ID: ${subjectId}`);
    // navigate(`/admin/subjects/${subjectId}`);
  };

  const handleEditSubject = (subjectId) => {
    alert(`Edit subject with ID: ${subjectId}`);
    // navigate(`/admin/subjects/edit/${subjectId}`);
  };

  const handleDeleteSubject = (subjectId) => {
    if (
      window.confirm(
        `Are you sure you want to delete subject with ID: ${subjectId}?`
      )
    ) {
      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      console.log(`Deleted subject with ID: ${subjectId}`);
      alert(`Subject with ID: ${subjectId} deleted (simulated).`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Subjects Management
        </h1>
        <p className="mt-1 text-slate-600">
          Manage academic subjects, credits, and their properties.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            name="search-subjects"
            id="search-subjects"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search subjects or code"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link
            to="/admin/subjects/new"
            className="w-full sm:w-auto flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#034078] hover:bg-[#001F54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034078] transition-colors"
          >
            Create Subject
          </Link>
          {/* "View All Subjects" button (as per design, though functionality might merge with search/filter) */}
          {/* <button
                type="button"
                onClick={() => { setSearchTerm(''); setSubjects(initialSubjects); alert('Showing all subjects.'); }}
                className="w-full sm:w-auto flex justify-center items-center px-6 py-2.5 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                View All Subjects
            </button> */}
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Subject Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Credits
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-15 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <tr
                    key={subject.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {subject.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {subject.has_practical ? "Theory + Lab" : "Theory"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewSubject(subject.id)}
                        title="View Details"
                        className="text-indigo-600 hover:text-indigo-800 cursor-pointer  transition-colors px-2"
                      >
                        <img
                          src="/src/assets/icons/eye2.svg"
                          alt="View"
                          className="w-5 h-5 inline"
                        />{" "}
                        {/* View Icon */}
                      </button>
                      <button
                        onClick={() => handleEditSubject(subject.id)}
                        title="Edit Subject"
                        className="text-sky-600 hover:text-sky-800 cursor-pointer  transition-colors px-2"
                      >
                        <img
                          src="/src/assets/icons/pencil.svg"
                          alt="Edit"
                          className="w-5 h-5 inline"
                        />{" "}
                        {/* Edit Icon */}
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        title="Delete Subject"
                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors px-2"
                      >
                        <img
                          src="/src/assets/icons/trash-2.svg"
                          alt="Delete"
                          className="w-5 h-5 inline"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No subjects found matching your search.{" "}
                    <Link
                      to="/admin/subjects/new"
                      className="text-indigo-600 hover:underline"
                    >
                      Add a new subject
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Placeholder for Pagination */}
      {subjects.length > 0 &&
        initialSubjects.length > 10 && ( // Show pagination if more than 10 initial subjects
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">
                {Math.min(10, subjects.length)}
              </span>{" "}
              of <span className="font-medium">{initialSubjects.length}</span>{" "}
              results
            </p>
            <div className="flex space-x-1">
              <button
                className="px-3 py-1 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 "
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default SubjectsListPage;
