import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

function MainLayout() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000); // update every second

    return () => clearInterval(interval); // cleanup when unmounted
  }, []);

  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  return (
    <div>
      <nav style={{
        background: '#1a1a1a',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Lecturer Attendance System</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>{dateStr} | {timeStr}</span>
          <Link to="/" style={{ color: 'white' }}>Login</Link>
          <Link to="/register" style={{ color: 'white' }}>Register</Link>
        </div>
      </nav>

      <main style={{ padding: '30px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
