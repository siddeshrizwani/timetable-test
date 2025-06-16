// frontend/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

// Layouts & Core Pages
import AdminLayout from "./pages/AdminLayout";
import FacultyLayout from "./pages/FacultyLayout";
import LoginPage from "./pages/LoginPage";
import PublicHomePage from "./pages/PublicHomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin Page Components
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import BatchesListPage from "./pages/admin/BatchesListPage";
import CreateBatchPage from "./pages/admin/CreateBatchPage";
import EditBatchPage from "./pages/admin/EditBatchPage";
import TeachersListPage from "./pages/admin/TeachersListPage";
import CreateTeacherPage from "./pages/admin/CreateTeacherPage";
import EditTeacherPage from "./pages/admin/EditTeacherPage";
import SubjectsListPage from "./pages/admin/SubjectsListPage";
import CreateSubjectPage from "./pages/admin/CreateSubjectPage";
import EditSubjectPage from "./pages/admin/EditSubjectPage";
import RoomsListPage from "./pages/admin/RoomsListPage";
import CreateRoomPage from "./pages/admin/CreateRoomPage";
import EditRoomPage from "./pages/admin/EditRoomPage";
import TimetableViewerPage from "./pages/admin/TimetableViewerPage";

// Faculty Page Components
import FacultyDashboardPage from "./pages/faculty/FacultyDashboardPage";
import MyCoursesPage from "./pages/faculty/MyCoursesPage";
import CourseDetailPage from "./pages/faculty/CourseDetailPage";
import FacultyProfilePage from "./pages/faculty/FacultyProfilePage";

// A component to protect routes that require authentication and specific roles.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a loading screen while we check for a valid session.
  if (loading) {
    return <div>Loading session...</div>;
  }

  // If not logged in, redirect to the login page.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user's role is not in the list of allowed roles, show a not found page.
  if (!allowedRoles.includes(user.role)) {
    return <NotFoundPage />;
  }

  // If everything is fine, render the requested component.
  return children;
};

// The main App component with all the route definitions.
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "super"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardOverview />} />
          <Route path="batches" element={<BatchesListPage />} />
          <Route path="batches/create" element={<CreateBatchPage />} />
          <Route path="batches/edit/:batchId" element={<EditBatchPage />} />
          <Route path="teachers" element={<TeachersListPage />} />
          <Route path="teachers/create" element={<CreateTeacherPage />} />
          <Route
            path="teachers/edit/:teacherId"
            element={<EditTeacherPage />}
          />
          <Route path="subjects" element={<SubjectsListPage />} />
          <Route path="subjects/create" element={<CreateSubjectPage />} />
          <Route
            path="subjects/edit/:subjectId"
            element={<EditSubjectPage />}
          />
          <Route path="rooms" element={<RoomsListPage />} />
          <Route path="rooms/create" element={<CreateRoomPage />} />
          <Route path="rooms/edit/:roomId" element={<EditRoomPage />} />
          <Route path="timetable" element={<TimetableViewerPage />} />
        </Route>

        {/* Faculty Routes */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={["faculty", "user"]}>
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboardPage />} />
          <Route path="courses" element={<MyCoursesPage />} />
          <Route
            path="courses/:courseId/batch/:batchId"
            element={<CourseDetailPage />}
          />
          <Route path="profile" element={<FacultyProfilePage />} />
        </Route>

        {/* Catch-all Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
