// src/pages/FacultyDashboardPage.jsx
import React from "react";

// A placeholder component for a single class item
const ClassCard = ({ time, subject, code, location, type }) => (
  <div
    className={`p-4 rounded-lg border-l-4 ${
      type === "lab"
        ? "border-teal-500 bg-teal-50"
        : "border-blue-500 bg-blue-50"
    }`}
  >
    <p className="font-bold text-slate-800">{time}</p>
    <p className="text-lg font-semibold text-slate-900 mt-1">{subject}</p>
    <div className="flex justify-between text-sm text-slate-600 mt-2">
      <span>{code}</span>
      <span>{location}</span>
    </div>
  </div>
);

const FacultyDashboardPage = () => {
  // In the future, this data will be fetched from an API
  const schedule = {
    monday: [
      {
        time: "10:00 AM - 11:00 AM",
        subject: "Advanced Algorithms",
        code: "CS401",
        location: "Room 301",
        type: "lecture",
      },
      {
        time: "02:00 PM - 04:00 PM",
        subject: "Algorithms Lab",
        code: "CS401L",
        location: "Lab 5A",
        type: "lab",
      },
    ],
    tuesday: [],
    wednesday: [
      {
        time: "11:00 AM - 12:00 PM",
        subject: "Advanced Algorithms",
        code: "CS401",
        location: "Room 301",
        type: "lecture",
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          My Weekly Schedule
        </h1>
        <p className="mt-1 text-slate-600">
          Here are your assigned classes for the upcoming week.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-2">
            Monday
          </h2>
          {schedule.monday.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedule.monday.map((cls) => (
                <ClassCard key={cls.time} {...cls} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-500">No classes scheduled.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-2">
            Tuesday
          </h2>
          {schedule.tuesday.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedule.tuesday.map((cls) => (
                <ClassCard key={cls.time} {...cls} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-500">No classes scheduled.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-2">
            Wednesday
          </h2>
          {schedule.wednesday.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedule.wednesday.map((cls) => (
                <ClassCard key={cls.time} {...cls} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-500">No classes scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
