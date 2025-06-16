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

  // Fetch the list of all batches for the dropdown (add real batches after dummy)
  useEffect(() => {
    const fetchBatches = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch("http://localhost:3000/api/batches", {
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
      // If dummy batch, load local sample
      if (selectedBatch === DUMMY_BATCH.batch_id) {
        try {
          const response = await fetch("/public/timetable_output.json");
          if (!response.ok) throw new Error("Failed to load sample timetable.");
          const data = await response.json();
          setSchedule(data.solution?.timetable || []);
        } catch (err) {
          setError(err.message);
          setSchedule([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      // Otherwise, fetch from API
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
        setSchedule(data.solution?.timetable || []);
      } catch (err) {
        setError(err.message);
        setSchedule([]); // Clear schedule on error
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
                      ) {
                        return (
                          <td
                            key={day + slotIdx}
                            className="td p-2 align-top h-24"
                            rowSpan={session.duration_slots}
                          >
                            <div className="bg-indigo-100 text-indigo-800 p-2 rounded-lg h-full flex flex-col justify-center">
                              <p className="font-bold text-sm">
                                {session.subject_name} ({session.type})
                              </p>
                              <p className="text-xs mt-1">
                                {session.teacher_name}
                              </p>
                              <p className="text-xs mt-1 font-mono bg-indigo-200 px-1 rounded w-fit">
                                {session.room_name}
                              </p>
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
