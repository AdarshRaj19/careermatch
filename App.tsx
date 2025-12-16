
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext'; // Import ToastProvider
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import StudentDashboardLayout from './layouts/StudentDashboardLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentInternshipsPage from './pages/student/StudentInternshipsPage';
import StudentPreferencesPage from './pages/student/StudentPreferencesPage';
import StudentDocumentsPage from './pages/student/StudentDocumentsPage';
import StudentAllocationPage from './pages/student/StudentAllocationPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentAiAdvisorPage from './pages/student/StudentAiAdvisorPage';
import StudentSavedItemsPage from './pages/student/StudentSavedItemsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminManageCoursesPage from './pages/admin/AdminManageCoursesPage';
import AdminManageInternshipsPage from './pages/admin/AdminManageInternshipsPage';
import AdminDataUploadPage from './pages/admin/AdminDataUploadPage';
import AdminAllocationEnginePage from './pages/admin/AdminAllocationEnginePage';
import AdminResultsDashboardPage from './pages/admin/AdminResultsDashboardPage';
import AdminFairnessReportPage from './pages/admin/AdminFairnessReportPage';
import AdminWhatIfSimulatorPage from './pages/admin/AdminWhatIfSimulatorPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminManageStudentsPage from './pages/admin/AdminManageStudentsPage'; // Import new page

const ProtectedRoute: React.FC<{ allowedRoles: ('student' | 'admin')[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student" element={<StudentDashboardLayout />}>
                  <Route path="dashboard" element={<StudentProfilePage />} />
                  <Route path="profile" element={<StudentProfilePage />} />
                  <Route path="internships" element={<StudentInternshipsPage />} />
                  <Route path="preferences" element={<StudentPreferencesPage />} />
                  <Route path="documents" element={<StudentDocumentsPage />} />
                  <Route path="allocation" element={<StudentAllocationPage />} />
                  <Route path="notifications" element={<StudentNotificationsPage />} />
                  <Route path="courses" element={<StudentCoursesPage />} />
                  <Route path="ai-advisor" element={<StudentAiAdvisorPage />} />
                  <Route path="saved" element={<StudentSavedItemsPage />} />
                  <Route index element={<Navigate to="dashboard" />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboardLayout />}>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="manage-courses" element={<AdminManageCoursesPage />} />
                  <Route path="manage-internships" element={<AdminManageInternshipsPage />} />
                  <Route path="manage-students" element={<AdminManageStudentsPage />} />
                  <Route path="data-upload" element={<AdminDataUploadPage />} />
                  <Route path="allocation-engine" element={<AdminAllocationEnginePage />} />
                  <Route path="results" element={<AdminResultsDashboardPage />} />
                  <Route path="fairness-report" element={<AdminFairnessReportPage />} />
                  <Route path="what-if-simulator" element={<AdminWhatIfSimulatorPage />} />
                  <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  <Route index element={<Navigate to="dashboard" />} />
                </Route>
              </Route>

            </Routes>
          </HashRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
