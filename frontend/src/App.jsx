import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/auth/AuthPage';
import HomePage from './pages/home/HomePage';
import HomeStatsPage from './pages/home/HomeStatsPage';
import BmiPage from './pages/home/tools/BmiPage';
import BmrPage from './pages/home/tools/BmrPage';
import WaterIntakePage from './pages/home/tools/WaterIntakePage';
import BloodPressureGuidePage from './pages/home/tools/BloodPressureGuidePage';
import SugarLevelGuidePage from './pages/home/tools/SugarLevelGuidePage';
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import Appointments from './pages/patient/Appointments';
import Prescriptions from './pages/patient/Prescriptions';
import Payments from './pages/patient/Payments';
import Profile from './pages/patient/Profile';
import MedicalRecords from './pages/patient/MedicalRecords';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPayments from './pages/doctor/DoctorPayments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorProfile from './pages/doctor/DoctorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import RouteSeo from './components/seo/RouteSeo';

const Loader = () => (
  <div style={{ minHeight:'100vh', background:'#f0f4f8', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px' }}>
    <div style={{ fontSize:'48px' }}>🏥</div>
    <div style={{ color:'#1565c0', fontSize:'20px', fontWeight:'700' }}>MediCare Pro</div>
    <div style={{ color:'#64748b', fontSize:'14px' }}>Loading...</div>
  </div>
);

// Protected layout wrapper
const ProtectedLayout = ({ allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return <AppLayout><Outlet /></AppLayout>;
};

// Public route - redirects to dashboard if already logged in
const PublicRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  
  return <AuthPage />;
};

const PublicHomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <HomePage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<PublicRoute />} />
      <Route path="/" element={<PublicHomeRoute />} />
      <Route path="/stats/:role" element={<HomeStatsPage />} />
      <Route path="/bmi" element={<BmiPage />} />
      <Route path="/bmr" element={<BmrPage />} />
      <Route path="/water-intake" element={<WaterIntakePage />} />
      <Route path="/blood-pressure-guide" element={<BloodPressureGuidePage />} />
      <Route path="/sugar-level-guide" element={<SugarLevelGuidePage />} />

      {/* Patient Routes */}
      <Route element={<ProtectedLayout allowedRole="patient" />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/find-doctors" element={<FindDoctors />} />
        <Route path="/patient/appointments" element={<Appointments />} />
        <Route path="/patient/prescriptions" element={<Prescriptions />} />
        <Route path="/patient/payments" element={<Payments />} />
        <Route path="/patient/records" element={<MedicalRecords />} />
        <Route path="/patient/profile" element={<Profile />} />
      </Route>

      {/* Doctor Routes */}
      <Route element={<ProtectedLayout allowedRole="doctor" />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/payments" element={<DoctorPayments />} />
        <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
        <Route path="/doctor/patients" element={<DoctorAppointments />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedLayout allowedRole="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/payments" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteSeo />
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { background:'#1e293b', color:'#f1f5f9', border:'1px solid #334155', fontSize:'13px' }
          }} />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
