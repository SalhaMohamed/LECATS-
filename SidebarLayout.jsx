import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const SidebarLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const role = localStorage.getItem('role');

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        height: '100vh',
        background: '#2C3E50',
        color: 'white',
        padding: '20px',
        boxSizing: 'border-box',
      }}>
        <h3 style={{ color: '#ECF0F1' }}>Menu</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {role === 'admin' && (
            <>
              <li><Link style={linkStyle} to="/admin/dashboard">Dashboard</Link></li>
              <li><Link style={linkStyle} to="/admin/department">Add Department</Link></li>
              <li><Link style={linkStyle} to="/admin/course">Add Course</Link></li>
              <li><Link style={linkStyle} to="/admin/user">Add User</Link></li>
            </>
          )}

          {role === 'cr' && (
            <li><Link style={linkStyle} to="/cr/dashboard">CR Dashboard</Link></li>
          )}

          {role === 'lecturer' && (
            <li><Link style={linkStyle} to="/lecturer/dashboard">Lecturer Dashboard</Link></li>
          )}

          {role === 'hod' && (
            <li><Link style={linkStyle} to="/hod/dashboard">HOD Dashboard</Link></li>
          )}

          {/* Common profile link */}
          <li><Link style={linkStyle} to="/profile">My Profile</Link></li>

          {/* Logout */}
          <li>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

const linkStyle = {
  display: 'block',
  padding: '10px 0',
  color: '#ECF0F1',
  textDecoration: 'none',
};

const logoutButtonStyle = {
  marginTop: '20px',
  background: 'red',
  color: 'white',
  border: 'none',
  padding: '10px',
  cursor: 'pointer',
  width: '100%',
  borderRadius: '5px',
};

export default SidebarLayout;
