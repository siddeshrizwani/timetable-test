// src/pages/admin/AdminDashboardOverview.jsx
import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  </div>
);

const AdminDashboardOverview = () => {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  // State for the solver control panel
  const [selectedBatch, setSelectedBatch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorStatus, setGeneratorStatus] = useState({
    message: "",
    type: "",
    batchId: null,
  });

  // Fetch initial data for stats and the batch dropdown
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const fetchData = async (url) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
      return response.json();
    };

    // Fetch both stats and the list of batches
    Promise.all([
      fetchData("/api/stats"),
      fetchData("/api/batches"),
    ])
      .then(([statsData, batchesData]) => {
        setStats(statsData);
        setBatches(batchesData);
        // Default the dropdown to the first batch in the list
        if (batchesData.length > 0) {
          setSelectedBatch(batchesData[0].batch_id);
        }
      })
      .catch((err) => {
        console.error("Dashboard data fetching error:", err);
        setGeneratorStatus({
          message: "Failed to load initial dashboard data.",
          type: "error",
        });
      });
  }, []);

  const handleGenerateTimetable = async () => {
    if (!selectedBatch) {
      setGeneratorStatus({
        message: "Please select a batch before generating.",
        type: "error",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratorStatus({
      message: "Initializing solver... This may take a minute.",
      type: "info",
    });

    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        "/api/generate-timetable",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ batch_id: selectedBatch }),
        }
      );      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.details ||
            data.msg ||
            "An unknown error occurred during generation."
        );
      }
      setGeneratorStatus({ 
        message: data.msg, 
        type: "success",
        batchId: selectedBatch
      });    } catch (err) {
      setGeneratorStatus({ 
        message: err.message, 
        type: "error",
        batchId: null
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-lg text-slate-600">
          Welcome back, {user?.username || "Admin"}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Batches"
          value={stats?.batches ?? "..."}
          icon="📚"
          color="bg-indigo-100"
        />
        <StatCard
          title="Total Subjects"
          value={stats?.subjects ?? "..."}
          icon="📖"
          color="bg-teal-100"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.teachers ?? "..."}
          icon="🧑‍🏫"
          color="bg-amber-100"
        />
        <StatCard
          title="Total Rooms"
          value={stats?.rooms ?? "..."}
          icon="🚪"
          color="bg-rose-100"
        />
      </div>

      {/* NEW: Timetable Engine Control Panel */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Timetable Engine
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-4 border-b pb-6 mb-4">
          <div className="w-full md:flex-1">
            <label htmlFor="batch-select" className="label mb-1">
              Select Batch to Generate
            </label>
            <select
              id="batch-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="input w-full"
              disabled={isGenerating}
            >
              <option value="" disabled>
                -- Select a Batch --
              </option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-auto self-end">
            <button
              onClick={handleGenerateTimetable}
              disabled={isGenerating || !selectedBatch}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {isGenerating ? "Generating..." : "Generate Timetable"}
            </button>
          </div>
        </div>        {generatorStatus.message && (
          <div className="mt-4 p-3 rounded-md text-sm font-medium">
            <p
              className={`
                    ${
                      generatorStatus.type === "success" ? "text-green-800" : ""
                    }
                    ${generatorStatus.type === "error" ? "text-red-800" : ""}
                    ${generatorStatus.type === "info" ? "text-blue-800" : ""}
                `}
            >
              <span className="font-bold">Status:</span>{" "}
              {generatorStatus.message}
            </p>
            {generatorStatus.type === "success" && generatorStatus.batchId && (
              <div className="mt-2">
                <Link 
                  to="/admin/timetable" 
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Generated Timetable
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Quick Actions
        </h3>        <div className="flex flex-wrap gap-4">
          <Link to="/admin/batches/new" className="btn btn-secondary">
            Create New Batch
          </Link>
          <Link to="/admin/subjects/new" className="btn btn-secondary">
            Create New Subject
          </Link>
          <Link to="/admin/teachers/new" className="btn btn-secondary">
            Add New Teacher
          </Link>
          <Link to="/admin/rooms/new" className="btn btn-secondary">
            Add New Room
          </Link>
          <Link to="/admin/timetable" className="btn btn-primary">
            📅 View Timetables
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
