import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { CandidateProfilePage } from '../pages/CandidateProfilePage';
import { JobSearchPage } from '../pages/JobSearchPage';
import { RecruiterDashboard } from '../pages/RecruiterDashboard';
import { JobManagementPage } from '../pages/JobManagementPage';
import { KanbanPipelinePage } from '../pages/KanbanPipelinePage';
import { InterviewerDashboard } from '../pages/InterviewerDashboard';
import { CodingAssessmentPage } from '../pages/CodingAssessmentPage';
import { HiringManagerDashboard } from '../pages/HiringManagerDashboard';
import { OfferLetterPage } from '../pages/OfferLetterPage';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <LandingPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/login"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <LoginPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <RegisterPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <ForgotPasswordPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/reset-password"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <ResetPasswordPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/verify-email"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <VerifyEmailPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/admin/login"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <AdminLoginPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/jobs"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow p-6 md:p-8">
              <JobSearchPage />
            </main>
            <Footer />
          </div>
        }
      />

      {/* Candidate Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
        <Route
          path="/candidate/dashboard"
          element={
            <DashboardLayout>
              <CandidateDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <DashboardLayout>
              <CandidateProfilePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/candidate/assessment"
          element={
            <DashboardLayout>
              <CodingAssessmentPage />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Recruiter Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']} />}>
        <Route
          path="/recruiter/dashboard"
          element={
            <DashboardLayout>
              <RecruiterDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/recruiter/jobs"
          element={
            <DashboardLayout>
              <JobManagementPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/recruiter/pipeline"
          element={
            <DashboardLayout>
              <KanbanPipelinePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <AnalyticsPage />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Interviewer Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['INTERVIEWER', 'ADMIN']} />}>
        <Route
          path="/interviewer/dashboard"
          element={
            <DashboardLayout>
              <InterviewerDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Hiring Manager Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['HIRING_MANAGER', 'ADMIN']} />}>
        <Route
          path="/manager/dashboard"
          element={
            <DashboardLayout>
              <HiringManagerDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route
          path="/admin/dashboard"
          element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Shared Offers Route */}
      <Route element={<ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN']} />}>
        <Route
          path="/offers"
          element={
            <DashboardLayout>
              <OfferLetterPage />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
