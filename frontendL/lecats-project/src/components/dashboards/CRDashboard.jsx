import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// Icons for a clear UI
import { ClockHistory, Check2Circle, XCircle } from 'react-bootstrap-icons';

function CRDashboard() {
  // --- STATE MANAGEMENT ---
  // State to hold only the classes scheduled for today
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchTodaysSchedule();
  }, []);

  async function fetchTodaysSchedule() {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Call the new "smart" endpoint for the CR
      const res = await axios.get('http://localhost:5000/api/cr/todays-schedule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodaysSchedule(res.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to fetch today\'s schedule');
    } finally {
      setIsLoading(false);
    }
  }

  // --- HANDLER FUNCTION ---
  const handleSubmit = async (scheduleId, isPresent) => {
    try {
      const token = localStorage.getItem('token');
      // Post to the new, structured attendance endpoint
      await axios.post('http://localhost:5000/api/attendance', {
        class_schedule_id: scheduleId,
        present: isPresent,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Attendance submitted successfully!');
      // Refresh the schedule to update the "submitted" status
      fetchTodaysSchedule();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to submit attendance');
    }
  };
  
  // --- RENDER LOGIC ---
  const renderSchedule = () => {
    if (isLoading) {
      return <div className="text-center p-5">Loading schedule...</div>;
    }
    if (todaysSchedule.length === 0) {
      return (
        <div className="text-center p-5">
            <ClockHistory size={40} className="mb-3 text-muted"/>
            <h4>No Classes Scheduled for Today</h4>
            <p className="text-muted">There is nothing to report at the moment.</p>
        </div>
      );
    }
    return (
      <ul className="list-group">
        {todaysSchedule.map((schedule) => (
          <li key={schedule.schedule_id} className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="mb-2 mb-md-0">
              <div className="fw-bold">{schedule.subject_name}</div>
              <small className="text-muted">
                {schedule.start_time} - {schedule.end_time} | {schedule.lecturer_name}
              </small>
            </div>
            <div>
              {schedule.submitted ? (
                <span className="badge bg-success-subtle text-success-emphasis p-2">
                  <Check2Circle className="me-1"/> Submitted
                </span>
              ) : (
                <div className="btn-group" role="group">
                  <button className="btn btn-outline-success" onClick={() => handleSubmit(schedule.schedule_id, true)}>
                    Present
                  </button>
                  <button className="btn btn-outline-danger" onClick={() => handleSubmit(schedule.schedule_id, false)}>
                    Absent
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg" style={{ width: '40rem', maxWidth: '90vw' }}>
        <div className="card-body p-4 p-md-5">
          <h2 className="card-title text-center fw-bold">
            Submit Today's Attendance
          </h2>
          <p className="text-center text-muted mb-4">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          {renderSchedule()}

        </div>
      </div>
    </div>
  );
}

export default CRDashboard;