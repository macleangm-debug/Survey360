import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore, useUIStore } from './store';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SurveysPage from './pages/SurveysPage';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import ResponsesPage from './pages/ResponsesPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { theme } = useUIStore();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveys"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SurveysPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveys/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SurveyBuilderPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveys/:id/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SurveyBuilderPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/responses"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResponsesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
