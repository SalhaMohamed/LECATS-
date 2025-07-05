import React, { useState } from 'react';

const dummyLecturers = [
  {
    id: 1,
    name: 'Dr. Mussa',
    module: 'Database Systems',
    attended: false,
    excuse: {
      fileName: 'dharura_mussa.pdf',
      comment: 'Nilikuwa na dharura ya matibabu.',
    },
  },
  {
    id: 2,
    name: 'Prof. Asha',
    module: 'Web Development',
    attended: true,
    excuse: null,
  },
  {
    id: 3,
    name: 'Mr. Juma',
    module: 'Computer Networks',
    attended: false,
    excuse: null,
  },
];

const HODDashboard = () => {
  const [status, setStatus] = useState({});

  // Fetch user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleStatusChange = (id, decision) => {
    setStatus(prev => ({
      ...prev,
      [id]: decision,
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2>HOD Dashboard</h2>
        {user?.picturePath && (
          <img
            src={`http://localhost:8080/uploads/${user.picturePath}`}
            alt="Profile"
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
        )}
      </div>
      <p style={{ color: '#666' }}>Review lecturer attendance for today</p>

      {dummyLecturers.map((lec) => (
        <div
          key={lec.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: status[lec.id] === 'excused'
              ? '#e6ffe6'
              : status[lec.id] === 'absent'
              ? '#ffe6e6'
              : lec.attended
              ? '#e6f7ff'
              : '#f9f9f9',
          }}
        >
          <h4>{lec.name} - {lec.module}</h4>

          {lec.attended ? (
            <p style={{ color: 'green' }}>Status: Present (Marked by CR)</p>
          ) : lec.excuse ? (
            <>
              <p><strong>Excuse File:</strong> <a href="#">{lec.excuse.fileName}</a></p>
              <p><strong>Comment:</strong> {lec.excuse.comment}</p>

              {!status[lec.id] && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleStatusChange(lec.id, 'excused')}
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px' }}
                  >
                    Accept Excuse
                  </button>
                  <button
                    onClick={() => handleStatusChange(lec.id, 'absent')}
                    style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px' }}
                  >
                    Reject Excuse
                  </button>
                </div>
              )}

              {status[lec.id] && (
                <p>
                  <strong>Status:</strong>{" "}
                  {status[lec.id] === 'excused' ? (
                    <span style={{ color: 'green' }}>Excused</span>
                  ) : (
                    <span style={{ color: 'red' }}>Absent</span>
                  )}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: 'red' }}>Status: Absent (No excuse submitted)</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default HODDashboard;
