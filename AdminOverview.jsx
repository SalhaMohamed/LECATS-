import React from 'react';

const AdminOverview = () => {
  // Dummy statistics — unaweza badilisha hizi na data halisi kutoka backend
  const stats = [
    { label: 'Total Users', value: 35 },
    { label: 'Lecturers', value: 10 },
    { label: 'Departments', value: 5 },
    { label: 'Courses', value: 12 },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <h2>Welcome Admin</h2>
        <p style={{ color: '#555' }}>Here is a quick summary of the system</p>

        <div className="cards">
          {stats.map((s, index) => (
            <div className="card" key={index}>
              <h3>{s.label}</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
