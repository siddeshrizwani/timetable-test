import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Page Imports
import PublicHomePage from "./pages/PublicHomePage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/AdminLayout";
import FacultyLayout from "./pages/FacultyLayout";
import NotFoundPage from "./pages/NotFoundPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Admin Pages
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import BatchesListPage from "./pages/admin/BatchesListPage";
import CreateBatchPage from "./pages/admin/CreateBatchPage";
import EditBatchPage from "./pages/admin/EditBatchPage";
import BatchDetailPage from "./pages/admin/BatchDetailPage";
import SubjectsListPage from "./pages/admin/SubjectsListPage";
import CreateSubjectPage from "./pages/admin/CreateSubjectPage";
import EditSubjectPage from "./pages/admin/EditSubjectPage";
import SubjectDetailPage from "./pages/admin/SubjectDetailPage";
import TeachersListPage from "./pages/admin/TeachersListPage";
import CreateTeacherPage from "./pages/admin/CreateTeacherPage";
import EditTeacherPage from "./pages/admin/EditTeacherPage";
import RoomsListPage from "./pages/admin/RoomsListPage";
import CreateRoomPage from "./pages/admin/CreateRoomPage";
import EditRoomPage from "./pages/admin/EditRoomPage";
import TimetableViewerPage from "./pages/admin/TimetableViewerPage";

// Faculty Pages
import FacultyDashboardPage from "./pages/faculty/FacultyDashboardPage";
import FacultyProfilePage from "./pages/faculty/FacultyProfilePage";
import MyCoursesPage from "./pages/faculty/MyCoursesPage";
import CourseDetailPage from "./pages/faculty/CourseDetailPage";

function App() {
  const [authDetails, setAuthDetails] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (token && role) setAuthDetails({ token, role });
  }, []);

  const handleLoginSuccess = (loginData) => {
    setAuthDetails(loginData);
    localStorage.setItem("authToken", loginData.token);
    localStorage.setItem("userRole", loginData.role);
  };

  const handleLogout = () => {
    setAuthDetails(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!authDetails?.token) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(authDetails.role))
      return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !authDetails ? (
              <PublicHomePage />
            ) : (
              <Navigate
                to={authDetails.role === "user" ? "/faculty" : "/admin"}
              />
            )
          }
        />
        <Route
          path="/login"
          element={
            !authDetails ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate
                to={authDetails.role === "user" ? "/faculty" : "/admin"}
              />
            )
          }
        />
        <Route
          path="/auth/callback"
          element={<AuthCallbackPage onLoginSuccess={handleLoginSuccess} />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "super"]}>
              <AdminLayout user={authDetails} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardOverview />} />
          <Route path="dashboard" element={<AdminDashboardOverview />} />
          <Route path="batches" element={<BatchesListPage />} />
          <Route path="batches/new" element={<CreateBatchPage />} />
          <Route path="batches/edit/:batchId" element={<EditBatchPage />} />
          <Route path="batches/:batchId" element={<BatchDetailPage />} />
          <Route path="subjects" element={<SubjectsListPage />} />
          <Route path="subjects/new" element={<CreateSubjectPage />} />
          <Route
            path="subjects/edit/:subjectId"
            element={<EditSubjectPage />}
          />
          <Route path="subjects/:subjectId" element={<SubjectDetailPage />} />
          <Route path="teachers" element={<TeachersListPage />} />
          <Route path="teachers/new" element={<CreateTeacherPage />} />
          <Route
            path="teachers/edit/:teacherId"
            element={<EditTeacherPage />}
          />
          <Route path="rooms" element={<RoomsListPage />} />
          <Route path="rooms/new" element={<CreateRoomPage />} />
          <Route path="rooms/edit/:roomId" element={<EditRoomPage />} />
          <Route path="timetable" element={<TimetableViewerPage />} />
        </Route>

        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FacultyLayout user={authDetails} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<FacultyDashboardPage />} />
          <Route path="dashboard" element={<FacultyDashboardPage />} />
          <Route path="courses" element={<MyCoursesPage />} />
          <Route path="courses/:batchId" element={<CourseDetailPage />} />
          <Route path="profile" element={<FacultyProfilePage />} />
        </Route>

        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FacultyLayout user={authDetails} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<FacultyDashboardPage />} />
          <Route path="dashboard" element={<FacultyDashboardPage />} />
          <Route path="courses" element={<MyCoursesPage />} /> {/* <-- NEW */}
          <Route path="courses/:batchId" element={<CourseDetailPage />} />{" "}
          {/* <-- NEW */}
          <Route path="profile" element={<FacultyProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
