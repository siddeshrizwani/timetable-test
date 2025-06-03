// src/pages/admin/BatchesListPage.jsx
import React, { useState, useMemo, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

// Placeholder Search Icon
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

// Placeholder data - expanded for pagination testing
const initialBatchesData = [
  { id: 1, name: "Batch A - 2024 CSE Sem 1" },
  { id: 2, name: "Batch B - 2024 ECE Sem 1" },
  { id: 3, name: "Batch C - 2023 MECH Sem 3" },
  { id: 4, name: "Batch D - 2024 CSE Sem 2 Evening" },
  { id: 5, name: "Batch E - 2023 ECE Sem 3 Part-time" },
  { id: 6, name: "Batch F - 2022 CSE Sem 5" },
  { id: 7, name: "Batch G - 2024 IT Sem 1" },
  { id: 8, name: "Batch H - 2023 CIVIL Sem 3" },
  { id: 9, name: "Batch I - 2022 EEE Sem 5" },
  { id: 10, name: "Batch J - 2024 CSE Sem 1 Section B" },
  { id: 11, name: "Batch K - 2023 MECH Sem 4" },
  { id: 12, name: "Batch L - 2024 IT Sem 2" },
];

const ITEMS_PER_PAGE = 5;

const BatchesListPage = () => {
  const navigate = useNavigate(); // For navigation for view/edit (optional)
  const [searchTerm, setSearchTerm] = useState("");
  // This state will hold all batches that match the current search term (or all batches if no search)
  const [displayableBatches, setDisplayableBatches] =
    useState(initialBatchesData);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle initial data and search filtering
  useEffect(() => {
    let filtered = initialBatchesData;
    if (searchTerm) {
      filtered = initialBatchesData.filter((batch) =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayableBatches(filtered);
    setCurrentPage(1); // Reset to first page whenever search term changes
  }, [searchTerm]); // Removed initialBatchesData from dependency array if it's static

  // Calculate current items for display based on pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentBatchesOnPage = displayableBatches.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(displayableBatches.length / ITEMS_PER_PAGE);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleViewBatch = (batchId) => {
    alert(`View batch with ID: ${batchId}`);
    // navigate(`/admin/batches/view/${batchId}`); // Example navigation
  };

  const handleEditBatch = (batchId) => {
    alert(`Edit batch with ID: ${batchId}`);
    // navigate(`/admin/batches/edit/${batchId}`); // Example navigation
  };

  const handleDeleteBatch = (batchId) => {
    if (
      window.confirm(
        `Are you sure you want to delete batch with ID: ${batchId}? This action cannot be undone.`
      )
    ) {
      // --- IMPORTANT ---
      // This is a LOCAL state update for DEMO purposes.
      // In a real app, you MUST:
      // 1. Call your backend API to delete the batch from the database.
      // 2. On successful deletion from backend, THEN update your frontend state.
      //    This usually involves refetching the list of batches or removing the item
      //    from a global state management solution (like Redux, Zustand, React Context).
      //    For now, we'll filter `initialBatchesData` to simulate this if it were mutable,
      //    or more simply, just filter the `displayableBatches` if you don't want to alter initial data.

      // Simulating deletion by filtering the source array (not ideal for real apps without backend)
      // initialBatchesData = initialBatchesData.filter(batch => batch.id !== batchId); // This would mutate if not const
      // For demo, let's just filter the current displayable and re-trigger pagination logic
      const newDisplayableBatches = displayableBatches.filter(
        (batch) => batch.id !== batchId
      );
      setDisplayableBatches(newDisplayableBatches);

      // Adjust current page if the last item on the page was deleted
      const newTotalPages = Math.ceil(
        newDisplayableBatches.length / ITEMS_PER_PAGE
      );
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0) {
        setCurrentPage(1);
      }

      console.log(`Simulated deletion of batch with ID: ${batchId}`);
      alert(`Batch with ID: ${batchId} 'deleted' (locally filtered for demo).`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Batches Management
        </h1>
        <p className="mt-1 text-slate-600">
          Manage your academic batches and their settings.
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            name="search-batches"
            id="search-batches"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search batches"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link
            to="/admin/batches/new"
            className="w-full sm:w-auto flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#034078] hover:bg-[#001F54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034078] transition-colors"
          >
            Create Batch
          </Link>
        </div>
      </div>

      {/* Batches Table/List */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Batch Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" // Adjusted padding from px-17
                >
                  Actions{" "}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentBatchesOnPage.length > 0 ? (
                currentBatchesOnPage.map((batch) => (
                  <tr
                    key={batch.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {batch.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewBatch(batch.id)}
                        title="View Details"
                        className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors p-1 rounded hover:bg-indigo-100"
                      >
                        <img
                          src="/src/assets/icons/eye2.svg" // Ensure this path is correct or use text/SVG
                          alt="View"
                          className="w-5 h-5 inline"
                        />
                      </button>
                      <button
                        onClick={() => handleEditBatch(batch.id)}
                        title="Edit Batch"
                        className="text-sky-600 hover:text-sky-800 cursor-pointer transition-colors p-1 rounded hover:bg-sky-100"
                      >
                        <img
                          src="/src/assets/icons/pencil.svg" // Ensure this path is correct
                          alt="Edit"
                          className="w-5 h-5 inline"
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        title="Delete Batch"
                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors p-1 rounded hover:bg-red-100"
                      >
                        <img
                          src="/src/assets/icons/trash-2.svg" // Ensure this path is correct
                          alt="Delete"
                          className="w-5 h-5 inline"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {searchTerm
                      ? "No batches found matching your search."
                      : "No batches available."}
                    {!searchTerm && displayableBatches.length === 0 && (
                      <Link
                        to="/admin/batches/new"
                        className="text-indigo-600 hover:underline ml-1"
                      >
                        Create one now
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p className="text-sm text-slate-700">
            Showing{" "}
            <span className="font-medium">
              {Math.min(indexOfFirstItem + 1, displayableBatches.length)}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, displayableBatches.length)}
            </span>{" "}
            of <span className="font-medium">{displayableBatches.length}</span>{" "}
            results
          </p>
          <div className="flex space-x-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
