import React from "react";

const TimetableViewerPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Timetable Viewer</h1>
      <p className="mt-2 text-slate-600">
        This page will display the generated timetable for a selected batch.
      </p>
      <div className="mt-8 p-10 bg-slate-200 rounded-lg flex items-center justify-center">
        <p className="text-slate-500 font-semibold">
          Timetable Grid Placeholder
        </p>
      </div>
    </div>
  );
};

export default TimetableViewerPage;
