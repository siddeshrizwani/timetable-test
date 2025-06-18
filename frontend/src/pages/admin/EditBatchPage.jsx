// src/pages/admin/EditBatchPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

// This component is very similar to CreateBatchPage, but it fetches existing data first.
const EditBatchPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  // Form state
  const [program, setProgram] = useState("");
  const [branch, setBranch] = useState("");
  const [startYear, setStartYear] = useState("");
  const [section, setSection] = useState("");
  const [semesterNumber, setSemesterNumber] = useState("");
  const [generatedBatchName, setGeneratedBatchName] = useState("");

  // Subjects state
  const [allAvailableSubjects, setAllAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);

  // Control state
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Fetch all subjects available for the dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch("/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch subjects.");
        const data = await response.json();
        setAllAvailableSubjects(data);
      } catch (error) {
        setFormErrors((prev) => ({ ...prev, subjects: error.message }));
      }
    };
    fetchSubjects();
  }, []);

  // Fetch the specific batch data to edit
  useEffect(() => {
    const fetchBatchData = async () => {
      setIsDataLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(
          `/api/batches/${batchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Could not fetch batch data.");
        const data = await res.json();

        // This is a simple parser. It could be more robust.
        const nameParts = data.name.match(
          /(\w+\.?\w*)\s*([\w\s]+?)\s*(\d{4})-(\d{4})\s*-\s*Section\s*(\w+)/
        );
        if (nameParts) {
          setProgram(nameParts[1] || "B.Tech");
          setBranch(nameParts[2].trim() || "");
          setStartYear(parseInt(nameParts[3], 10) || "");
          setSection(nameParts[5] || "A");
        } else {
          setGeneratedBatchName(data.name); // Fallback for names that don't match pattern
        }

        setSemesterNumber(data.semester_number || "");
        setSelectedSubjects(data.subjects || []);
      } catch (error) {
        setFormErrors({ form: error.message });
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchBatchData();
  }, [batchId]);

  // Regenerate name preview when parts change
  useEffect(() => {
    const endYear = parseInt(startYear, 10) + 4;
    const yearRange = startYear ? `${startYear}-${endYear}` : "";
    const name = `${program} ${branch} ${yearRange} - Section ${section}`;
    setGeneratedBatchName(name.trim());
  }, [program, branch, startYear, section]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation would go here...
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    const updatedBatchData = {
      name: generatedBatchName,
      academic_year: parseInt(startYear, 10),
      semester_number: parseInt(semesterNumber, 10),
      department: branch,
      subject_ids: selectedSubjects.map((s) => s.subject_id),
    };

    try {
      const response = await fetch(
        `/api/batches/${batchId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedBatchData),
        }
      );
      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.msg || "Failed to update batch.");

      alert("Batch updated successfully!");
      navigate("/admin/batches");
    } catch (error) {
      setFormErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // The rest of the component is very similar to CreateBatchPage
  // It uses the same logic for the searchable subject dropdown
  const filteredAvailableSubjects = allAvailableSubjects.filter(
    (subject) =>
      (subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(subjectSearchTerm.toLowerCase())) &&
      !selectedSubjects.find((ss) => ss.subject_id === subject.subject_id)
  );

  const handleSubjectSelect = (subject) => {
    setSelectedSubjects([...selectedSubjects, subject]);
    setSubjectSearchTerm("");
  };

  const handleRemoveSelectedSubject = (subjectIdToRemove) => {
    setSelectedSubjects(
      selectedSubjects.filter(
        (subject) => subject.subject_id !== subjectIdToRemove
      )
    );
  };

  if (isDataLoading)
    return <div className="text-center p-10">Loading batch data...</div>;

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Edit Batch</h1>
        <p className="mt-1 text-slate-600">
          Update the details and curriculum for this batch.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formErrors.form && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {formErrors.form}
          </div>
        )}

        {/* The form structure is identical to CreateBatchPage, but fields are pre-filled */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label
              htmlFor="program"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Program
            </label>
            <select
              id="program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="block w-full input"
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
              Branch/Dept
            </label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="block w-full input"
            />
          </div>
          <div>
            <label
              htmlFor="startYear"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Start Year
            </label>
            <input
              type="number"
              id="startYear"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="block w-full input"
            />
          </div>
          <div>
            <label
              htmlFor="section"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Section
            </label>
            <input
              type="text"
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="block w-full input"
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
              value={generatedBatchName}
              readOnly
              className="block w-full input bg-slate-100"
            />
          </div>
          <div>
            <label
              htmlFor="semesterNumber"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Semester
            </label>
            <input
              type="number"
              id="semesterNumber"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(e.target.value)}
              className="block w-full input"
            />
          </div>
        </div>
        <div ref={subjectDropdownRef} className="pt-2">
          <label
            htmlFor="subjectSearch"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Assign Subjects
          </label>
          <div className="relative">
            <input
              type="text"
              id="subjectSearch"
              placeholder="Search to add subjects..."
              value={subjectSearchTerm}
              onChange={(e) => {
                setSubjectSearchTerm(e.target.value);
                setIsSubjectDropdownOpen(true);
              }}
              onFocus={() => setIsSubjectDropdownOpen(true)}
              className="block w-full input pr-10"
            />
            {isSubjectDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredAvailableSubjects.map((subject) => (
                  <div
                    key={subject.subject_id}
                    onClick={() => handleSubjectSelect(subject)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 hover:bg-indigo-600 hover:text-white"
                  >
                    <span className="block truncate">
                      {subject.name} ({subject.code})
                    </span>
                  </div>
                ))}
              </div>
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
          <Link to="/admin/batches" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBatchPage;
