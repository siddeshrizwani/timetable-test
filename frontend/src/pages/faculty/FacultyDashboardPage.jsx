// frontend/src/pages/faculty/FacultyDashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const StatCard = ({ title, value, icon, color }) => (
  <div className={`p-6 rounded-xl shadow-lg border ${color}`}>
    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
      {title}
    </p>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const ClassCard = ({ time, subject, batch, room, isLab }) => (
  <div
    className={`p-4 rounded-lg border-l-4 shadow-sm ${
      isLab ? "border-teal-500 bg-teal-50" : "border-blue-500 bg-blue-50"
    }`}
  >
    <p className="font-bold text-sm text-slate-800">{time}</p>
    <p className="text-lg font-semibold text-slate-900 mt-1">{subject}</p>
    <div className="text-sm text-slate-600 mt-2">
      <p>
        <strong>Batch:</strong> {batch}
      </p>
      <p>
        <strong>Room:</strong> {room}
      </p>
    </div>
  </div>
);

const FacultyDashboardPage = () => {
  const { user, token } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null); // <-- Add state for stats
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/faculty/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(
            errData.msg || "Failed to fetch your dashboard data."
          );
        }
        const data = await response.json();

        // ** FIX: Correctly set state from the response object **
        setSchedule(data.schedule || []); // Ensure it's always an array
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  const groupedSchedule = useMemo(() => {
    if (!schedule || schedule.length === 0) return {};
    return schedule.reduce((acc, session) => {
      const day = session.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(session);
      return acc;
    }, {});
  }, [schedule]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (isLoading) {
    return <div className="text-center p-10">Loading your dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
        <p className="font-bold">An error occurred:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Faculty Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Welcome, {user?.username || user?.email || "Faculty"}.
        </p>
      </div>

      {/* --- Display Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Courses Assigned"
          value={stats?.total_courses ?? "0"}
          color="border-blue-200 bg-white"
        />
        <StatCard
          title="Total Weekly Hours"
          value={parseFloat(stats?.total_hours ?? 0).toFixed(1)}
          color="border-teal-200 bg-white"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          My Weekly Schedule
        </h2>
        <div className="space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day}>
              <h3 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">
                {day}
              </h3>
              {groupedSchedule[day] && groupedSchedule[day].length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedSchedule[day].map((session) => (
                    <ClassCard
                      key={session.session_id}
                      time={`${new Date(
                        `1970-01-01T${session.start_time}`
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })} - ${new Date(
                        `1970-01-01T${session.end_time}`
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}`}
                      subject={session.subject_name}
                      batch={session.batch_name}
                      room={session.room_name}
                      isLab={session.is_lab}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No classes scheduled for {day}.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
