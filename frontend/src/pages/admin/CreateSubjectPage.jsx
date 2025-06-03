// src/pages/admin/CreateSubjectPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Link is not used directly here, so removed

// Placeholder for available faculty - in a real app, fetch this from API
const allAvailableFaculty = [
  { id: "fac1", name: "Dr. Eleanor Vance (Computer Science)" },
  { id: "fac2", name: "Prof. Marcus Cole (Electrical Engineering)" },
  { id: "fac3", name: "Dr. Anya Sharma (Mechanical Engineering)" },
  { id: "fac4", name: "Prof. Samuel Green (General Studies)" },
  { id: "fac5", name: "Dr. Olivia Chen (Physics Department)" },
  { id: "fac6", name: "Prof. Ben Carter (Mathematics)" },
];

const CreateSubjectPage = () => {
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [credits, setCredits] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [hasPractical, setHasPractical] = useState(false);

  // State for searchable faculty dropdown
  const [assignedFacultyId, setAssignedFacultyId] = useState(""); // Store only the ID
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState(false);
  const facultyDropdownRef = useRef(null);

  const [section, setSection] = useState("");
  const [hasBacklog, setHasBacklog] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  // Filter faculty for the dropdown
  const filteredAvailableFaculty = allAvailableFaculty.filter((faculty) =>
    faculty.name.toLowerCase().includes(facultySearchTerm.toLowerCase())
  );

  const handleFacultySelect = (faculty) => {
    setAssignedFacultyId(faculty.id); // Store the ID
    setFacultySearchTerm(faculty.name); // Show the name in input after selection
    setIsFacultyDropdownOpen(false); // Close dropdown
  };

  // Effect to handle clicks outside the faculty dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        facultyDropdownRef.current &&
        !facultyDropdownRef.current.contains(event.target)
      ) {
        setIsFacultyDropdownOpen(false);
        // Optional: If search term does not match a selected faculty, clear it or reset to selected faculty name
        const selectedFaculty = allAvailableFaculty.find(
          (f) => f.id === assignedFacultyId
        );
        if (selectedFaculty && facultySearchTerm !== selectedFaculty.name) {
          setFacultySearchTerm(selectedFaculty.name); // Revert to selected name if click outside without selection
        } else if (!selectedFaculty && facultySearchTerm !== "") {
          // setFacultySearchTerm(''); // Or clear if nothing is selected
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [assignedFacultyId, facultySearchTerm]);

  const validateForm = () => {
    const errors = {};
    if (!subjectName.trim()) errors.subjectName = "Subject Name is required.";
    if (!subjectCode.trim()) errors.subjectCode = "Subject Code is required.";
    if (!credits.trim() || isNaN(credits) || Number(credits) <= 0)
      errors.credits = "Valid Credits (number > 0) are required.";
    if (
      hoursPerWeek.trim() &&
      (isNaN(hoursPerWeek) || Number(hoursPerWeek) < 0)
    )
      errors.hoursPerWeek = "Hours per Week must be a valid number.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Form validation failed", formErrors);
      return;
    }

    const subjectData = {
      name: subjectName,
      code: subjectCode,
      credits: Number(credits),
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
      hasPractical,
      facultyId: assignedFacultyId || null,
      section: section || null,
      canBeBacklog: hasBacklog,
    };
    console.log("Creating subject with data:", subjectData);
    alert("Subject creation submitted (simulated). Check console for data.");
    navigate("/admin/subjects");
  };

  const handleCancel = () => {
    navigate("/admin/subjects");
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Create Subject</h1>
        <p className="mt-1 text-slate-600">
          Define a new academic subject and its properties.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Name */}
        <div>
          <label
            htmlFor="subjectName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subjectName"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g., Introduction to Algorithms"
            className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
              formErrors.subjectName
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
          />
          {formErrors.subjectName && (
            <p className="mt-1 text-xs text-red-500">
              {formErrors.subjectName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Code */}
          <div>
            <label
              htmlFor="subjectCode"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subjectCode"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="e.g., CS201"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.subjectCode
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.subjectCode && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.subjectCode}
              </p>
            )}
          </div>

          {/* Credits */}
          <div>
            <label
              htmlFor="credits"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Credits <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="credits"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="e.g., 3 or 4"
              min="0"
              step="0.5"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.credits
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.credits && (
              <p className="mt-1 text-xs text-red-500">{formErrors.credits}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hours per Week */}
          <div>
            <label
              htmlFor="hoursPerWeek"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Hours per Week (Optional)
            </label>
            <input
              type="number"
              id="hoursPerWeek"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              placeholder="e.g., 3 (lectures) + 2 (lab)"
              min="0"
              className={`appearance-none block w-full px-4 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                formErrors.hoursPerWeek
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {formErrors.hoursPerWeek && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.hoursPerWeek}
              </p>
            )}
          </div>
          {/* Searchable Faculty Dropdown */}
          <div ref={facultyDropdownRef}>
            <label
              htmlFor="facultySearch"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Default Faculty (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="facultySearch"
                placeholder="Search or select faculty..."
                value={facultySearchTerm}
                onChange={(e) => {
                  setFacultySearchTerm(e.target.value);
                  setIsFacultyDropdownOpen(true);
                  setAssignedFacultyId(""); // Clear actual selection when user types
                }}
                onFocus={() => {
                  setIsFacultyDropdownOpen(true);
                  // Clear search term when focusing if a faculty is already selected, to allow re-searching
                  // Or, keep the current name to allow modification of search from current name
                  // setFacultySearchTerm(''); // If you want to always start search fresh
                }}
                className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
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
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
              {isFacultyDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredAvailableFaculty.length > 0 ? (
                    filteredAvailableFaculty.map((faculty) => (
                      <div
                        key={faculty.id}
                        onClick={() => handleFacultySelect(faculty)}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-indigo-600 hover:text-white"
                      >
                        <span className="block truncate">{faculty.name}</span>
                        {assignedFacultyId === faculty.id && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-hover:text-white">
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="cursor-default select-none relative py-2 px-3 text-slate-700">
                      No faculty found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>{" "}
          {/* End of Searchable Faculty Dropdown */}
        </div>

        {/* Section (Optional) */}
        <div>
          <label
            htmlFor="section"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Section / Group (Optional)
          </label>
          <input
            type="text"
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., A, B, or common for all"
            className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Has Practical */}
          <div className="flex items-center pt-2">
            <input
              id="hasPractical"
              name="hasPractical"
              type="checkbox"
              checked={hasPractical}
              onChange={(e) => setHasPractical(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <label
              htmlFor="hasPractical"
              className="ml-3 block text-sm font-medium text-slate-700"
            >
              Includes Practical/Lab Sessions
            </label>
          </div>

          {/* Can be Backlog */}
          <div className="flex items-center pt-2">
            <input
              id="hasBacklog"
              name="hasBacklog"
              type="checkbox"
              checked={hasBacklog}
              onChange={(e) => setHasBacklog(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <label
              htmlFor="hasBacklog"
              className="ml-3 block text-sm font-medium text-slate-700"
            >
              Can be offered as a Backlog Subject
            </label>
          </div>
        </div>

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
            Create Subject
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubjectPage;
