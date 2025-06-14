import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTeacherPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("http://localhost:3000/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.msg || "Failed to create teacher.");
      alert("Teacher created successfully!");
      navigate("/admin/teachers");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Add New Teacher
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="label">Temporary Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/teachers")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Teacher
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeacherPage;
