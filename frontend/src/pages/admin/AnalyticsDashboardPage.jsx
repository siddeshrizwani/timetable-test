// src/pages/admin/AnalyticsDashboardPage.jsx
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
);

const AnalyticsDashboardPage = () => {
  const [teacherWorkload, setTeacherWorkload] = useState(null);
  const [roomUtilization, setRoomUtilization] = useState(null);
  const [departmentLoad, setDepartmentLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      try {
        const endpoints = [
          "/api/analytics/teacher-workload",
          "/api/analytics/room-utilization",
          "/api/analytics/department-load",
        ];
        const requests = endpoints.map((url) =>
          fetch(`http://localhost:3000${url}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        const responses = await Promise.all(requests);

        for (const response of responses) {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch analytics data. Server responded with status ${response.status}.`
            );
          }
        }

        const [teacherData, roomData, deptData] = await Promise.all(
          responses.map((r) => r.json())
        );

        setTeacherWorkload({
          labels: teacherData.map((d) => d.teacher_name),
          datasets: [
            {
              label: "Total Assigned Credits",
              data: teacherData.map((d) => d.total_assigned_credits),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        setRoomUtilization({
          labels: roomData.map((d) => d.room_name),
          datasets: [
            {
              label: "Total Hours Booked per Week",
              data: roomData.map((d) => d.total_hours_booked),
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setDepartmentLoad(deptData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading)
    return <div className="text-center p-10">Loading analytics data...</div>;
  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
        {error}
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Analytics & Reports
        </h1>
        <p className="mt-1 text-slate-600">
          Visual insights into your institution's scheduling data.
        </p>
      </div>

      {teacherWorkload && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Teacher Workload (by Assigned Credits)
          </h2>
          <Bar
            data={teacherWorkload}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
      )}

      {roomUtilization && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Room Utilization (Hours Booked per Week)
          </h2>
          <Bar
            data={roomUtilization}
            options={{ responsive: true, indexAxis: "y" }}
          />
        </div>
      )}

      {departmentLoad && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Departmental Load
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Department</th>
                  <th className="th">Unique Subjects Taught</th>
                  <th className="th">Total Classes Scheduled</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {departmentLoad.map((dept) => (
                  <tr key={dept.department}>
                    <td className="td font-medium">{dept.department}</td>
                    <td className="td">{dept.unique_subjects}</td>
                    <td className="td">{dept.total_classes_scheduled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
