import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, lecturers: 0, departments: 0, courses: 0 });

  useEffect(() => {
    axios.get('http://localhost:8080/api/admin/summary')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching admin stats:', err));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin! <img src={`http://localhost:8080${user.picturePath}`} alt="Profile" />
      </p>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div><strong>Total Users:</strong> {stats.users}</div>
        <div><strong>Lecturers:</strong> {stats.lecturers}</div>
        <div><strong>Departments:</strong> {stats.departments}</div>
        <div><strong>Courses:</strong> {stats.courses}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
