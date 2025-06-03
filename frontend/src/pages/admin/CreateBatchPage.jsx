// src/pages/admin/CreateBatchPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Placeholder for available subjects - in a real app, fetch this from API
const allAvailableSubjects = [
  { id: "subj1", name: "Mathematics I" },
  { id: "subj2", name: "Introduction to Programming" },
  { id: "subj3", name: "Physics for Engineers" },
  { id: "subj4", name: "Communication Skills" },
  { id: "subj5", name: "Data Structures & Algorithms" },
  { id: "subj6", name: "Digital Electronics & Logic Design" },
  { id: "subj7", name: "Database Management Systems" },
  { id: "subj8", name: "Operating Systems" },
  { id: "subj9", name: "Computer Networks" },
  { id: "subj10", name: "Software Engineering Principles" },
];

const CreateBatchPage = () => {
  const navigate = useNavigate();
  const [batchName, setBatchName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [studentSize, setStudentSize] = useState("");
  const [totalCredit, setTotalCredit] = useState(""); // As per original design

  // State for searchable subject dropdown
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});

  // Filter subjects for the dropdown, excluding already selected ones
  const filteredAvailableSubjects = allAvailableSubjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) &&
      !selectedSubjects.find((ss) => ss.id === subject.id)
  );

  const handleSubjectSelect = (subject) => {
    setSelectedSubjects([...selectedSubjects, subject]);
    setSubjectSearchTerm(""); // Clear search term
    setIsSubjectDropdownOpen(false); // Close dropdown
  };

  const handleRemoveSelectedSubject = (subjectIdToRemove) => {
    setSelectedSubjects(
      selectedSubjects.filter((subject) => subject.id !== subjectIdToRemove)
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!batchName.trim()) errors.batchName = "Batch Name is required.";
    if (!year.trim() || !/^\d{4}$/.test(year))
      errors.year = "Valid Year (YYYY) is required.";
    if (!semester.trim()) errors.semester = "Semester is required.";
    if (!department.trim()) errors.department = "Department is required.";
    if (!studentSize.trim() || isNaN(studentSize) || Number(studentSize) <= 0)
      errors.studentSize = "Valid Student Size is required.";
    if (totalCredit.trim() && (isNaN(totalCredit) || Number(totalCredit) < 0))
      errors.totalCredit = "Valid Total Credit (if provided) is required.";
    if (selectedSubjects.length === 0)
      errors.selectedSubjects = "At least one subject must be assigned.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Form validation failed", formErrors);
      return;
    }

    const batchData = {
      batchName,
      year,
      semester,
      department,
      studentSize: Number(studentSize),
      totalCredit: totalCredit ? Number(totalCredit) : null,
      subjects: selectedSubjects.map((s) => ({ id: s.id, name: s.name })), // Send IDs or full objects
    };
    console.log("Creating batch with data:", batchData);
    alert("Batch creation submitted (simulated). Check console for data.");
    navigate("/admin/batches");
  };

  const handleCancel = () => {
    navigate("/admin/batches");
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Create Batch</h1>
        <p className="mt-1 text-slate-600">
          Define the academic structure for a new batch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Batch Name */}
        <div>
          <label
            htmlFor="batchName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Batch Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="batchName"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g., Computer Science 2024-2028"
            className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
              formErrors.batchName
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {formErrors.batchName && (
            <p className="mt-1 text-xs text-red-500">{formErrors.batchName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Year */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2024"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.year
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.year && (
              <p className="mt-1 text-xs text-red-500">{formErrors.year}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label
              htmlFor="semester"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Semester <span className="text-red-500">*</span>
            </label>
            <input // Could be a select dropdown
              type="text"
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g., Fall 2024 or 1st Semester"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.semester
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.semester && (
              <p className="mt-1 text-xs text-red-500">{formErrors.semester}</p>
            )}
          </div>
        </div>

        {/* Department */}
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Department <span className="text-red-500">*</span>
          </label>
          <input // Could be a select dropdown
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g., Computer Science & Engineering"
            className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
              formErrors.department
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {formErrors.department && (
            <p className="mt-1 text-xs text-red-500">{formErrors.department}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Size */}
          <div>
            <label
              htmlFor="studentSize"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Student Size <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="studentSize"
              value={studentSize}
              onChange={(e) => setStudentSize(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.studentSize
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.studentSize && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.studentSize}
              </p>
            )}
          </div>

          {/* Total Credit */}
          <div>
            <label
              htmlFor="totalCredit"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Total Credits for Batch (Optional)
            </label>
            <input
              type="number"
              id="totalCredit"
              value={totalCredit}
              onChange={(e) => setTotalCredit(e.target.value)}
              placeholder="e.g., 120 (usually derived)"
              min="0"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.totalCredit
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.totalCredit && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.totalCredit}
              </p>
            )}
          </div>
        </div>

        {/* Searchable Subject Dropdown */}
        <div ref={subjectDropdownRef}>
          <label
            htmlFor="subjectSearch"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Assign Subjects <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="subjectSearch"
              placeholder="Search and select subjects..."
              value={subjectSearchTerm}
              onChange={(e) => {
                setSubjectSearchTerm(e.target.value);
                setIsSubjectDropdownOpen(true);
              }}
              onFocus={() => setIsSubjectDropdownOpen(true)}
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.selectedSubjects
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </span>

            {isSubjectDropdownOpen && filteredAvailableSubjects.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredAvailableSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-indigo-600 hover:text-white"
                  >
                    <span className="block truncate">{subject.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {formErrors.selectedSubjects && (
            <p className="mt-1 text-xs text-red-500">
              {formErrors.selectedSubjects}
            </p>
          )}
        </div>

        {/* Display Selected Subjects as Tags */}
        {selectedSubjects.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Selected Subjects:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <span
                  key={subject.id}
                  className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full"
                >
                  {subject.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedSubject(subject.id)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    aria-label={`Remove ${subject.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#034078] hover:bg-[#001F54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034078] transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBatchPage;
