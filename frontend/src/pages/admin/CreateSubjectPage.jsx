import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSubjectPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lectureCredits, setLectureCredits] = useState("");
  const [labCredits, setLabCredits] = useState("0");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation logic...
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    const subjectData = {
      name,
      code,
      lecture_credits: parseInt(lectureCredits),
      lab_credits: parseInt(labCredits),
    };

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subjectData),
      });
      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.msg || "Failed to create subject.");
      alert("Subject created successfully!");
      navigate("/admin/subjects");
    } catch (error) {
      setFormErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Create New Subject
        </h1>
        <p className="mt-1 text-slate-600">
          Define a new academic subject and its properties.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formErrors.form && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {formErrors.form}
          </div>
        )}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Subject Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="lectureCredits"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Lecture Credits <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="lectureCredits"
              value={lectureCredits}
              onChange={(e) => setLectureCredits(e.target.value)}
              className="input w-full"
              min="0"
              required
            />
          </div>
          <div>
            <label
              htmlFor="labCredits"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Lab Credits <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="labCredits"
              value={labCredits}
              onChange={(e) => setLabCredits(e.target.value)}
              className="input w-full"
              min="0"
              required
            />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/subjects")}
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
            {isLoading ? "Submitting..." : "Create Subject"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubjectPage;
