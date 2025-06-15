import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditSubjectPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lectureCredits, setLectureCredits] = useState("");
  const [labCredits, setLabCredits] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectData = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/subjects/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Could not fetch subject data.");
        const data = await response.json();
        setName(data.name);
        setCode(data.code);
        setLectureCredits(data.lecture_credits);
        setLabCredits(data.lab_credits);
      } catch (error) {
        setFormErrors({ form: error.message });
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchSubjectData();
  }, [subjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    const subjectData = {
      name,
      code,
      lecture_credits: parseInt(lectureCredits),
      lab_credits: parseInt(labCredits),
    };
    try {
      const response = await fetch(
        `http://localhost:3000/api/subjects/${subjectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subjectData),
        }
      );
      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.msg || "Failed to update subject.");
      alert("Subject updated successfully!");
      navigate("/admin/subjects");
    } catch (error) {
      setFormErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading)
    return <div className="text-center p-10">Loading subject data...</div>;

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Edit Subject</h1>
        <p className="mt-1 text-slate-600">Update the details for "{name}".</p>
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
            Subject Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Subject Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="lectureCredits"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Lecture Credits
            </label>
            <input
              type="number"
              id="lectureCredits"
              value={lectureCredits}
              onChange={(e) => setLectureCredits(e.target.value)}
              className="input w-full"
              min="0"
            />
          </div>
          <div>
            <label
              htmlFor="labCredits"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Lab Credits
            </label>
            <input
              type="number"
              id="labCredits"
              value={labCredits}
              onChange={(e) => setLabCredits(e.target.value)}
              className="input w-full"
              min="0"
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
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSubjectPage;
