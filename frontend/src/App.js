import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore, useUIStore } from './store';
import { LoginPage, RegisterPage, AuthCallbackPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { FormsPage } from './pages/FormsPage';
import { FormBuilderPage } from './pages/FormBuilderPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { TeamPage, CreateOrganizationPage } from './pages/TeamPage';
import { CasesPage } from './pages/CasesPage';
import { QualityPage } from './pages/QualityPage';
import { SettingsPage } from './pages/SettingsPage';
import '@/App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route wrapper (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { theme } = useUIStore();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/forms" element={
            <ProtectedRoute>
              <FormsPage />
            </ProtectedRoute>
          } />
          <Route path="/forms/new" element={
            <ProtectedRoute>
              <FormsPage />
            </ProtectedRoute>
          } />
          <Route path="/forms/:formId" element={
            <ProtectedRoute>
              <FormBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/forms/:formId/edit" element={
            <ProtectedRoute>
              <FormBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/submissions" element={
            <ProtectedRoute>
              <SubmissionsPage />
            </ProtectedRoute>
          } />
          <Route path="/cases" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/quality" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/exports" element={
            <ProtectedRoute>
              <SubmissionsPage />
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/organizations/new" element={
            <ProtectedRoute>
              <CreateOrganizationPage />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      
      <Toaster 
        position="top-right" 
        richColors 
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }
        }}
      />
    </div>
  );
}

export default App;
