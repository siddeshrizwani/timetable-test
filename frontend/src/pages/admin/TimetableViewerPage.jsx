// src/pages/admin/TimetableViewerPage.jsx
import React, { useState, useEffect } from "react";

const TimetableViewerPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the list of all batches for the dropdown
  useEffect(() => {
    const fetchBatches = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch("http://localhost:3000/api/batches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch batches.");
        const data = await response.json();
        setBatches(data);
        if (data.length > 0) {
          setSelectedBatch(data[0].batch_id); // Default to first batch
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchBatches();
  }, []);

  // Fetch the timetable for the selected batch whenever it changes
  useEffect(() => {
    if (!selectedBatch) return;

    const fetchTimetable = async () => {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/timetable/${selectedBatch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch timetable for this batch.");
        const data = await response.json();
        setSchedule(data);
      } catch (err) {
        setError(err.message);
        setSchedule([]); // Clear schedule on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedBatch]);

  // --- Helper data for building the grid ---
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "09:00:00",
    "10:00:00",
    "11:00:00",
    "12:00:00",
    "14:00:00",
    "15:00:00",
    "16:00:00",
    "17:00:00",
  ];

  // Create a lookup map for quick access to scheduled classes
  const scheduleMap = new Map();
  schedule.forEach((item) => {
    const key = `${item.day_of_week}-${item.start_time}`;
    scheduleMap.set(key, item);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">View Timetable</h1>
          <p className="mt-1 text-slate-600">
            Select a batch to view its generated weekly schedule.
          </p>
        </div>
        <div className="w-full md:w-1/3">
          <label htmlFor="batch-select-viewer" className="label mb-1 sr-only">
            Select Batch
          </label>
          <select
            id="batch-select-viewer"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="input w-full"
          >
            {batches.length === 0 && <option>Loading batches...</option>}
            {batches.map((batch) => (
              <option key={batch.batch_id} value={batch.batch_id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="th sticky left-0 bg-slate-100 z-10">Time</th>
                {days.map((day) => (
                  <th key={day} className="th">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={days.length + 1} className="td text-center h-64">
                    Loading Schedule...
                  </td>
                </tr>
              ) : (
                timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="td sticky left-0 bg-white md:bg-slate-50 font-semibold z-10">
                      {time.substring(0, 5)}
                    </td>
                    {days.map((day) => {
                      const key = `${day}-${time}`;
                      const session = scheduleMap.get(key);
                      return (
                        <td key={key} className="td p-2 align-top h-24">
                          {session ? (
                            <div className="bg-indigo-100 text-indigo-800 p-2 rounded-lg h-full flex flex-col justify-center">
                              <p className="font-bold text-sm">
                                {session.subject_name}
                              </p>
                              <p className="text-xs mt-1">
                                {session.teacher_name}
                              </p>
                              <p className="text-xs mt-1 font-mono bg-indigo-200 px-1 rounded w-fit">
                                {session.room_name}
                              </p>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetableViewerPage;
