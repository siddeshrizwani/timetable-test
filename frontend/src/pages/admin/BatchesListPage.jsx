// src/pages/admin/BatchesListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import eye2 from '../../assets/icons/eye2.svg';
import pencil from '../../assets/icons/pencil.svg';
import trash2 from '../../assets/icons/trash-2.svg';

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
const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const ITEMS_PER_PAGE = 10;

const BatchesListPage = () => {
  const navigate = useNavigate();
  const [allBatches, setAllBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/batches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // --- MODIFIED: Improved Error Handling ---
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Authorization failed. Please ensure you are logged in as an admin."
          );
        }
        throw new Error(
          `Failed to fetch batches. Server responded with status: ${response.status}`
        );
      }

      const data = await response.json();
      setAllBatches(data);
      setFilteredBatches(data); // Set filtered batches initially
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    const results = allBatches.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBatches(results);
    setCurrentPage(1);
  }, [searchTerm, allBatches]);

  const currentBatchesOnPage = filteredBatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);

  const handleDeleteBatch = async (batchId, batchName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the batch "${batchName}"? This action cannot be undone.`
      )
    ) {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/batches/${batchId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to delete batch.");
        }

        const resData = await response.json();
        alert(resData.msg || "Batch deleted successfully!");
        fetchBatches();
      } catch (error) {
        console.error("Delete failed:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Batches Management
          </h1>
          <p className="mt-1 text-slate-600">
            View, create, and manage all academic batches.
          </p>
        </div>
        <Link to="/admin/batches/new" className="btn btn-primary">
          Create New Batch
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <div className="relative sm:max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <button
          onClick={fetchBatches}
          className="btn btn-secondary flex items-center gap-2"
          title="Refresh list"
        >
          <RefreshIcon />
          Refresh
        </button>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Batch Name</th>
                <th className="th">Department</th>
                <th className="th">Semester</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="td text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="td text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : currentBatchesOnPage.length > 0 ? (
                currentBatchesOnPage.map((batch) => (
                  <tr key={batch.batch_id} className="hover:bg-slate-50">
                    <td className="td font-medium">{batch.name}</td>
                    <td className="td">{batch.department}</td>
                    <td className="td">{batch.semester_number}</td>
                    <td className="td">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/batches/${batch.batch_id}`}
                          title="View"
                          className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                        >
                          <img
                            src={eye2}
                            alt="View"
                            className="w-5 h-5"
                          />
                        </Link>
                        <Link
                          to={`/admin/batches/edit/${batch.batch_id}`}
                          title="Edit"
                          className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-sky-50"
                        >
                          <img
                            src={pencil}
                            alt="Edit"
                            className="w-5 h-5"
                          />
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteBatch(batch.batch_id, batch.name)
                          }
                          title="Delete"
                          className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50"
                        >
                          <img
                            src={trash2}
                            alt="Delete"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="td text-center">
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-slate-700">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesListPage;
