// src/pages/faculty/FacultyDashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

// A reusable component for displaying a single class session
const ClassCard = ({ time, subject, batch, room }) => (
  <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 text-left">
    <p className="font-bold text-sm text-slate-800">{time}</p>
    <p className="text-lg font-semibold text-slate-900 mt-1">{subject}</p>
    <div className="text-sm text-slate-600 mt-2">
      <p>Batch: {batch}</p>
      <p>Room: {room}</p>
    </div>
  </div>
);

const FacultyDashboardPage = () => {
  const { user } = useOutletContext(); // Get user data from the layout context
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the logged-in faculty member's schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          "/api/faculty/my-schedule",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch your schedule. Please try again later."
          );
        }
        const data = await response.json();
        setSchedule(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // Group the schedule by day of the week for easy rendering
  const groupedSchedule = useMemo(() => {
    return schedule.reduce((acc, session) => {
      const day = session.day_of_week;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(session);
      return acc;
    }, {});
  }, [schedule]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          My Weekly Schedule
        </h1>
        <p className="mt-1 text-slate-600">
          Welcome, {user?.username || "Faculty"}. Here are your assigned classes
          for the week.
        </p>
      </div>

      {isLoading && (
        <p className="text-center p-10">Loading your schedule...</p>
      )}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day}>
              <h2 className="text-xl font-semibold text-slate-700 border-b pb-2">
                {day}
              </h2>
              {groupedSchedule[day] && groupedSchedule[day].length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedSchedule[day].map((session) => (
                    <ClassCard
                      key={session.session_id}
                      time={`${new Date(
                        `1970-01-01T${session.start_time}Z`
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - ${new Date(
                        `1970-01-01T${session.end_time}Z`
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                      subject={session.subject_name}
                      batch={session.batch_name}
                      room={session.room_name}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500">
                  No classes scheduled for {day}.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyDashboardPage;
