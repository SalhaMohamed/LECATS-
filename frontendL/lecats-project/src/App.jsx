import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Layout and Protection
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard Pages
import CRDashboard from './components/dashboards/CRDashboard';
import LecturerDashboard from './components/dashboards/LecturerDashboard';
import HODDashboard from './components/dashboards/HODDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Router>
        <Routes>
          {/* Public routes that anyone can access */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />

          {/* Protected routes that require a user to be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/cr" element={<CRDashboard />} />
              <Route path="/lecturer" element={<LecturerDashboard />} />
              <Route path="/hod" element={<HODDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
          
        </Routes>
      </Router>
    </>
  );
}

export default App;