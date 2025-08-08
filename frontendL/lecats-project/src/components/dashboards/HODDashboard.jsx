import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Nav } from 'react-bootstrap'; // Using Navs for the tabbed interface
// Import icons for the new UI
import { CalendarPlus, Table, CheckCircleFill, XCircleFill, Download, Clipboard2Check, Trash } from 'react-bootstrap-icons';

function HODDashboard() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('timetable'); // To control which tab is active
  
  // State for Timetable Management
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [scheduleFormData, setScheduleFormData] = useState({
    subject_id: '',
    lecturer_id: '',
    day_of_week: 'Monday',
    start_time: '',
    end_time: ''
  });
  
  // State for Pending Verifications
  const [pendingAttendances, setPendingAttendances] = useState([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    // Fetch data relevant to the HOD's role
    fetchHODData();
    fetchSchedules();
    fetchPending();
  }, []);
  
  // Fetches subjects and lecturers for the HOD's department
  async function fetchHODData() {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/hod/data-for-timetable', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(res.data.subjects);
        setLecturers(res.data.lecturers);
    } catch (error) {
        toast.error('Failed to fetch subjects and lecturers');
    }
  }

  // Fetches the current timetable for the HOD's department
  async function fetchSchedules() {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/hod/schedules', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(res.data);
    } catch (error) {
        toast.error(error.response?.data?.msg || 'Failed to fetch schedule');
    }
  }

  // Fetches pending attendance records for verification
  async function fetchPending() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/hod/attendance/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingAttendances(res.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to fetch pending attendance');
    }
  }

  // --- HANDLER FUNCTIONS ---
  const handleScheduleFormChange = (e) => {
    setScheduleFormData({ ...scheduleFormData, [e.target.name]: e.target.value });
  };
  
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/hod/schedules', scheduleFormData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Class added to timetable successfully!');
        fetchSchedules(); // Refresh the timetable view
    } catch (error) {
        toast.error(error.response?.data?.msg || 'Failed to schedule class');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to remove this class from the schedule?')) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/hod/schedules/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Scheduled class deleted successfully!');
            fetchSchedules(); // Refresh the timetable
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to delete scheduled class');
        }
    }
  };

  const handleVerify = async (id) => {
    if (window.confirm('Are you sure you want to verify this attendance record?')) {
        // ... (existing handleVerify logic remains the same)
    }
  };

  // --- RENDER FUNCTIONS ---
  const renderTimetableManager = () => (
    <>
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex align-items-center">
                <CalendarPlus size={20} className="me-2"/>
                <h5 className="mb-0">Schedule a New Class</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleAddSchedule} className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label htmlFor="subject_id" className="form-label">Subject</label>
                        <select name="subject_id" id="subject_id" className="form-select" onChange={handleScheduleFormChange} required>
                            <option value="">-- Select Subject --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="lecturer_id" className="form-label">Lecturer</label>
                        <select name="lecturer_id" id="lecturer_id" className="form-select" onChange={handleScheduleFormChange} required>
                            <option value="">-- Select Lecturer --</option>
                            {lecturers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="day_of_week" className="form-label">Day</label>
                        <select name="day_of_week" id="day_of_week" className="form-select" onChange={handleScheduleFormChange}>
                            <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
                        </select>
                    </div>
                    <div className="col-md-3 row g-2">
                        <div className="col-6"><label htmlFor="start_time" className="form-label">From</label><input type="time" name="start_time" id="start_time" className="form-control" onChange={handleScheduleFormChange} required/></div>
                        <div className="col-6"><label htmlFor="end_time" className="form-label">To</label><input type="time" name="end_time" id="end_time" className="form-control" onChange={handleScheduleFormChange} required/></div>
                    </div>
                    <div className="col-12 text-end">
                        <button className="btn btn-primary" type="submit">Add to Schedule</button>
                    </div>
                </form>
            </div>
        </div>

        <div className="card shadow-sm">
            <div className="card-header d-flex align-items-center">
                <Table size={20} className="me-2"/>
                <h5 className="mb-0">Current Timetable (Active Semester)</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-striped mb-0 align-middle">
                        <thead className="table-light">
                            <tr><th>Subject</th><th>Lecturer</th><th>Day</th><th>Time</th><th className="text-center">Action</th></tr>
                        </thead>
                        <tbody>
                            {schedules.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.subject_name}</strong></td>
                                    <td>{s.lecturer_name}</td>
                                    <td>{s.day_of_week}</td>
                                    <td>{s.start_time} - {s.end_time}</td>
                                    <td className="text-center">
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteSchedule(s.id)}><Trash/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
  );

  const renderPendingVerifications = () => (
    // This is your existing JSX for the verification table
    <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Pending Attendance Verification</h5>
            <span className="badge bg-warning text-dark rounded-pill">{pendingAttendances.length} Pending</span>
        </div>
        <div className="card-body p-0">
            {/* ... your existing table for pending attendances JSX ... */}
        </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      <h1 className="h2 mb-4 fw-bold">HOD Dashboard</h1>
      
      <Nav variant="pills" activeKey={view} onSelect={(selectedKey) => setView(selectedKey)} className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="timetable">Timetable Manager</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="verification">
            Pending Verifications <span className="badge bg-danger ms-1">{pendingAttendances.length}</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Conditionally render the view based on the active tab */}
      {view === 'timetable' && renderTimetableManager()}
      {view === 'verification' && renderPendingVerifications()}

    </div>
  );
}

export default HODDashboard;