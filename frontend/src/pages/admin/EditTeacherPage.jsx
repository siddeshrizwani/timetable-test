// src/pages/admin/EditTeacherPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditTeacherPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const fetchTeacher = async () => {
      setIsDataLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/teachers/${teacherId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Failed to fetch data");
        setName(data.name);
        setOriginalName(data.name); // Store original name for the title
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `http://localhost:3000/api/teachers/${teacherId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Update failed");
      setSuccess("Teacher details updated successfully! Redirecting...");
      setTimeout(() => navigate("/admin/teachers"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <div className="text-center p-10">Loading teacher data...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/admin/teachers"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
        >
          &larr; Back to Teachers List
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Edit Teacher</h1>
        <p className="mt-1 text-slate-600">
          Update the details for "{originalName}".
        </p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        <div>
          <label htmlFor="name" className="label">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/teachers")}
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

export default EditTeacherPage;
