import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CRDashboard = () => {
  const [lecturers, setLecturers] = useState([]);
  const [user, setUser] = useState(null); // To show user profile picture

  useEffect(() => {
    // Fetch lecturers for today
    axios.get('http://localhost:8080/api/cr/lecturers/today')
      .then(res => setLecturers(res.data))
      .catch(err => console.error(err));

    // Get user from localStorage (must be set after login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAttendance = (id, attended, punctual) => {
    axios.post('http://localhost:8080/api/cr/submit-attendance', { id, attended, punctual })
      .then(() => alert('Attendance submitted'))
      .catch(err => alert('Failed to submit'));
  };

  return (
    <div>
      <h2>
        Class Representative Dashboard
        {user && user.picturePath && (
          <img
            src={`http://localhost:8080/uploads/${user.picturePath}`}
            alt="Profile"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              marginLeft: '10px',
              verticalAlign: 'middle'
            }}
          />
        )}
      </h2>

      <table>
        <thead>
          <tr>
            <th>Lecturer</th>
            <th>Module</th>
            <th>Attend</th>
            <th>Punctual</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {lecturers.map(l => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.module}</td>
              <td>
                <input
                  type="checkbox"
                  onChange={e => l.attended = e.target.checked}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  onChange={e => l.punctual = e.target.checked}
                />
              </td>
              <td>
                <button onClick={() => handleAttendance(l.id, l.attended, l.punctual)}>
                  Submit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CRDashboard;
