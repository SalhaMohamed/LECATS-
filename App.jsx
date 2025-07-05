import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import CRDashboard from './components/CRDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import HODDashboard from './components/HODDashboard';
import MainLayout from './Layout/MainLayout';
import SidebarLayout from './Layout/SidebarLayout';
import AdminOverview from './components/AdminOverview';
import AddDepartment from './components/AddDepartment';
import AddCourse from './components/AddCourse';
import AddUser from './components/AddUser';
import Profile from './components/Profile';

function App() {
  return (
    <Routes>
      {/* Public Layout (Login/Register) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} /> {/* <== added this line */}
        <Route path="/register" element={<RegisterForm />} />
        
      </Route>

      {/* Admin Sidebar Layout */}
      <Route element={<SidebarLayout />}>
        <Route path="/admin/dashboard" element={<AdminOverview />} />
        <Route path="/admin/department" element={<AddDepartment />} />
        <Route path="/admin/course" element={<AddCourse />} />
        <Route path="/admin/user" element={<AddUser />} />

        {/* CR, Lecturer, HOD dashboards */}
        <Route path="/cr/dashboard" element={<CRDashboard />} />
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
        <Route path="/hod/dashboard" element={<HODDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}


export default App;
