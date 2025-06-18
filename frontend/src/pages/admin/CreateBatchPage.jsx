// src/pages/admin/CreateBatchPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CreateBatchPage = () => {
  const navigate = useNavigate();

  const [program, setProgram] = useState("B.Tech");
  const [branch, setBranch] = useState("");
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [section, setSection] = useState("A");
  const [semesterNumber, setSemesterNumber] = useState("");
  const [generatedBatchName, setGeneratedBatchName] = useState("");

  const [allAvailableSubjects, setAllAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsSubjectsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch subjects.");
        const data = await response.json();
        setAllAvailableSubjects(data);
      } catch (error) {
        setFormErrors((prev) => ({ ...prev, subjects: error.message }));
      } finally {
        setIsSubjectsLoading(false);
      }
    };
    fetchSubjects();
  }, [navigate]);

  useEffect(() => {
    const endYear = parseInt(startYear, 10) + 4;
    const yearRange = startYear ? `${startYear}-${endYear}` : "";
    const name = `${program} ${branch} ${yearRange} - Section ${section}`;
    setGeneratedBatchName(name.trim());
  }, [program, branch, startYear, section]);

  const filteredAvailableSubjects = allAvailableSubjects.filter(
    (subject) =>
      (subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(subjectSearchTerm.toLowerCase())) &&
      !selectedSubjects.find((ss) => ss.subject_id === subject.subject_id)
  );

  const handleSubjectSelect = (subject) => {
    setSelectedSubjects([...selectedSubjects, subject]);
    setSubjectSearchTerm("");
    setIsSubjectDropdownOpen(false);
  };

  const handleRemoveSelectedSubject = (subjectIdToRemove) => {
    setSelectedSubjects(
      selectedSubjects.filter(
        (subject) => subject.subject_id !== subjectIdToRemove
      )
    );
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    // ... validation logic remains the same
    const errors = {};
    if (!program.trim()) errors.program = "Program is required.";
    if (!branch.trim()) errors.branch = "Branch is required.";
    if (!startYear.toString().trim() || !/^\d{4}$/.test(startYear))
      errors.startYear = "A valid 4-digit start year is required.";
    if (!section.trim()) errors.section = "Section is required.";
    if (
      !semesterNumber.trim() ||
      isNaN(semesterNumber) ||
      Number(semesterNumber) <= 0
    )
      errors.semesterNumber = "A valid semester number is required.";
    if (selectedSubjects.length === 0)
      errors.subjects = "At least one subject must be assigned.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- MODIFIED: This function now sends data to the backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors
    if (!validateForm()) return;

    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    const batchData = {
      name: generatedBatchName,
      academic_year: parseInt(startYear, 10),
      semester_number: parseInt(semesterNumber, 10),
      department: branch,
      subject_ids: selectedSubjects.map((s) => s.subject_id),
    };

    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(batchData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(responseData.msg || `Server error: ${response.status}`);
      }

      alert("Batch created successfully!");
      navigate("/admin/batches"); // Navigate back to the list page
    } catch (error) {
      console.error("Batch creation failed:", error);
      setFormErrors({ form: error.message }); // Display form-wide error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Create New Batch</h1>
        <p className="mt-1 text-slate-600">
          Define the details and curriculum for a new academic batch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display general form error */}
        {formErrors.form && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {formErrors.form}
          </div>
        )}

        {/* Form inputs remain the same as before */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label
              htmlFor="program"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Program <span className="text-red-500">*</span>
            </label>
            <select
              id="program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className={`block w-full input ${
                formErrors.program ? "input-error" : ""
              }`}
            >
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="BBA">BBA</option>
              <option value="MBA">MBA</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="branch"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Branch/Dept <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g., CSE"
              className={`block w-full input ${
                formErrors.branch ? "input-error" : ""
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="startYear"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Start Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="startYear"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="YYYY"
              className={`block w-full input ${
                formErrors.startYear ? "input-error" : ""
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="section"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Section <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., A"
              className={`block w-full input ${
                formErrors.section ? "input-error" : ""
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="generatedName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Generated Batch Name
            </label>
            <input
              type="text"
              id="generatedName"
              value={generatedBatchName}
              readOnly
              className="block w-full input bg-slate-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label
              htmlFor="semesterNumber"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Semester Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="semesterNumber"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(e.target.value)}
              placeholder="e.g., 3"
              min="1"
              max="10"
              className={`block w-full input ${
                formErrors.semesterNumber ? "input-error" : ""
              }`}
            />
          </div>
        </div>

        {/* The rest of the JSX remains the same... */}
        <div ref={subjectDropdownRef} className="pt-2">
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
              placeholder="Search by subject name or code..."
              value={subjectSearchTerm}
              onChange={(e) => {
                setSubjectSearchTerm(e.target.value);
                setIsSubjectDropdownOpen(true);
              }}
              onFocus={() => setIsSubjectDropdownOpen(true)}
              className={`block w-full input pr-10 ${
                formErrors.subjects ? "input-error" : ""
              }`}
              disabled={isSubjectsLoading}
            />
            {isSubjectsLoading ? (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md p-3 text-sm text-slate-500">
                Loading subjects...
              </div>
            ) : formErrors.subjects ? (
              <p className="mt-1 text-xs text-red-500">{formErrors.subjects}</p>
            ) : (
              isSubjectDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredAvailableSubjects.length > 0 ? (
                    filteredAvailableSubjects.map((subject) => (
                      <div
                        key={subject.subject_id}
                        onClick={() => handleSubjectSelect(subject)}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-indigo-600 hover:text-white"
                      >
                        <span className="block truncate">
                          {subject.name} ({subject.code})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="cursor-default select-none relative py-2 px-3 text-slate-700">
                      No subjects found.
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {selectedSubjects.length > 0 && (
          <div className="mt-3 p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Selected Subjects:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <span
                  key={subject.subject_id}
                  className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                >
                  {subject.name}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSelectedSubject(subject.subject_id)
                    }
                    className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                    aria-label={`Remove ${subject.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200 mt-8">
          <button
            type="button"
            onClick={() => navigate("/admin/batches")}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Create Batch"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBatchPage;
