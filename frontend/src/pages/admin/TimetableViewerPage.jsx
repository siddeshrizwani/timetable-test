// src/pages/admin/TimetableViewerPage.jsx
import React, { useState, useEffect } from "react";

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

// Helper: Map day_index to day name
const dayIndexToName = (idx) => days[idx] || "";
// Helper: Map slot index to time string
const slotIdxToTime = (idx) => timeSlots[idx] || "";

const DUMMY_BATCH = {
  batch_id: "dummy",
  name: "Sample Batch (Demo)",
};

const TimetableViewerPage = () => {
  const [batches, setBatches] = useState([DUMMY_BATCH]);
  const [selectedBatch, setSelectedBatch] = useState(DUMMY_BATCH.batch_id);
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timetableInfo, setTimetableInfo] = useState(null);

  // Fetch the list of all batches for the dropdown (add real batches after dummy)
  useEffect(() => {
    const fetchBatches = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch("/api/batches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch batches.");
        const data = await response.json();
        setBatches([DUMMY_BATCH, ...data]);
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
      setTimetableInfo(null);
      
      // If dummy batch, load local sample
      if (selectedBatch === DUMMY_BATCH.batch_id) {
        try {
          const response = await fetch("/timetable_output.json");
          if (!response.ok) throw new Error("Failed to load sample timetable.");
          const data = await response.json();
          setSchedule(data.solution?.timetable || []);
          setTimetableInfo({
            status: data.status,
            objective_value: data.objective_value,
            batch_info: data.batch_info,
            error_message: data.error_message
          });
        } catch (err) {
          setError(err.message);
          setSchedule([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      // Try to fetch generated timetable first
      const token = localStorage.getItem("authToken");
      try {
        // First try the public file
        const publicResponse = await fetch(`/timetable_${selectedBatch}.json`);
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          setSchedule(data.solution?.timetable || []);
          setTimetableInfo({
            status: data.status,
            objective_value: data.objective_value,
            batch_info: data.batch_info,
            error_message: data.error_message
          });
          setIsLoading(false);
          return;
        }
        
        // Fallback to API
        const response = await fetch(
          `/api/timetable/${selectedBatch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch timetable for this batch.");
        const data = await response.json();
        setSchedule(data.solution?.timetable || []);
        setTimetableInfo({
          status: data.status,
          objective_value: data.objective_value,
          batch_info: data.batch_info,
          error_message: data.error_message
        });
      } catch (err) {
        setError(err.message);
        setSchedule([]); // Clear schedule on error
        setTimetableInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedBatch]);
  // Build a grid: [day][slot] = session or null
  const grid = Array.from({ length: 5 }, () => Array(8).fill(null));
  schedule.forEach((item) => {
    const { day_index, start_slot_in_day, duration_slots } = item;
    for (let i = 0; i < duration_slots; i++) {
      grid[day_index][start_slot_in_day + i] = item;
    }
  });

  const handleRefresh = () => {
    if (selectedBatch) {
      // Trigger a re-fetch by updating the dependency
      const fetchTimetable = async () => {
        setIsLoading(true);
        setError("");
        setTimetableInfo(null);
        
        if (selectedBatch === DUMMY_BATCH.batch_id) {
          try {
            const response = await fetch("/timetable_output.json?t=" + Date.now());
            if (!response.ok) throw new Error("Failed to load sample timetable.");
            const data = await response.json();
            setSchedule(data.solution?.timetable || []);
            setTimetableInfo({
              status: data.status,
              objective_value: data.objective_value,
              batch_info: data.batch_info,
              error_message: data.error_message
            });
          } catch (err) {
            setError(err.message);
            setSchedule([]);
          } finally {
            setIsLoading(false);
          }
          return;
        }
        
        const token = localStorage.getItem("authToken");
        try {
          const publicResponse = await fetch(`/timetable_${selectedBatch}.json?t=${Date.now()}`);
          if (publicResponse.ok) {
            const data = await publicResponse.json();
            setSchedule(data.solution?.timetable || []);
            setTimetableInfo({
              status: data.status,
              objective_value: data.objective_value,
              batch_info: data.batch_info,
              error_message: data.error_message
            });
            setIsLoading(false);
            return;
          }
          
          const response = await fetch(
            `/api/timetable/${selectedBatch}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!response.ok)
            throw new Error("Failed to fetch timetable for this batch.");
          const data = await response.json();
          setSchedule(data.solution?.timetable || []);
          setTimetableInfo({
            status: data.status,
            objective_value: data.objective_value,
            batch_info: data.batch_info,
            error_message: data.error_message
          });
        } catch (err) {
          setError(err.message);
          setSchedule([]);
          setTimetableInfo(null);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTimetable();
    }
  };

  return (
    <div className="space-y-6">      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">View Timetable</h1>
          <p className="mt-1 text-slate-600">
            Select a batch to view its generated weekly schedule.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-full md:w-64">
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
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>{error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}      {/* Timetable Status Info */}
      {timetableInfo && (
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                timetableInfo.status === 'OPTIMAL' ? 'bg-green-100 text-green-800' :
                timetableInfo.status === 'FEASIBLE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {timetableInfo.status}
              </span>
            </div>
            {timetableInfo.objective_value && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Objective Value:</span>
                <span className="text-blue-600">{timetableInfo.objective_value}</span>
              </div>
            )}
            {timetableInfo.batch_info?.name && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Batch:</span>
                <span className="text-gray-700">{timetableInfo.batch_info.name}</span>
              </div>
            )}
          </div>
          
          {/* Timetable Statistics */}
          {schedule.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-3">
              <span>📚 Total Sessions: {schedule.length}</span>
              <span>🧑‍🏫 Lectures: {schedule.filter(s => s.type === 'Lec').length}</span>
              <span>🔬 Labs: {schedule.filter(s => s.type === 'Lab').length}</span>
              <span>📖 Subjects: {new Set(schedule.map(s => s.subject_id)).size}</span>
              <span>👨‍🏫 Teachers: {new Set(schedule.map(s => s.teacher_id)).size}</span>
              <span>🏛️ Rooms: {new Set(schedule.map(s => s.room_id)).size}</span>
            </div>
          )}
          
          {timetableInfo.error_message && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-sm">
              <strong>Error:</strong> {timetableInfo.error_message}
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="th sticky left-0 bg-slate-100 z-10">Time</th>
                {days.map((day, dayIdx) => (
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
                timeSlots.map((time, slotIdx) => (
                  <tr key={time}>
                    <td className="td sticky left-0 bg-white md:bg-slate-50 font-semibold z-10">
                      {time.substring(0, 5)}
                    </td>
                    {days.map((day, dayIdx) => {
                      const session = grid[dayIdx][slotIdx];
                      // Only render the session at its start slot
                      if (
                        session &&
                        session.start_slot_in_day === slotIdx &&
                        session.day_index === dayIdx
                      ) {                        return (
                          <td
                            key={day + slotIdx}
                            className="td p-2 align-top h-24"
                            rowSpan={session.duration_slots}
                          >
                            <div className={`p-2 rounded-lg h-full flex flex-col justify-center ${
                              session.type === 'Lab' 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}>
                              <p className="font-bold text-sm">
                                {session.subject_name || session.subject_code} 
                                <span className="ml-1 text-xs font-normal">
                                  ({session.type})
                                </span>
                              </p>
                              <p className="text-xs mt-1">
                                📚 {session.teacher_name}
                              </p>
                              <p className="text-xs mt-1 font-mono bg-white bg-opacity-50 px-1 rounded w-fit">
                                🏛️ {session.room_name}
                              </p>
                              {session.duration_slots > 1 && (
                                <p className="text-xs mt-1 text-gray-600">
                                  ⏱️ {session.duration_slots} slots
                                </p>
                              )}
                            </div>
                          </td>
                        );
                      }
                      // If this slot is covered by a multi-slot session, skip cell
                      if (
                        session &&
                        session.start_slot_in_day < slotIdx &&
                        slotIdx <= session.end_slot_in_day &&
                        session.day_index === dayIdx
                      ) {
                        return null;
                      }
                      return <td key={day + slotIdx} className="td"></td>;
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
