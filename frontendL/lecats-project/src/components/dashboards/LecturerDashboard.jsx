import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal, Button, Nav } from 'react-bootstrap';
import { CalendarWeek, CheckCircleFill, XCircleFill, Upload, PencilSquare, InfoCircleFill } from 'react-bootstrap-icons';

function LecturerDashboard() {
  // --- STATE MANAGEMENT ---
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' })); // Default to today

  // State for the excuse submission modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/lecturer/dashboard-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedule(res.data.schedule);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  // --- MODAL & FORM HANDLERS ---
  const handleShowModal = (attendanceRecord) => {
    setSelectedAttendance(attendanceRecord);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAttendance(null);
    setSelectedFile(null);
    setComment('');
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitExcuse = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warn('Please select a PDF file to upload.');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/lecturer/attendance/${selectedAttendance.id}/excuse`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Excuse uploaded successfully!');
      handleCloseModal();
      fetchDashboardData(); // Refresh all data to show the update
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to upload excuse');
    } finally {
      setIsUploading(false);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const classesForDay = schedule.filter(s => s.day_of_week === activeDay);

  return (
    <>
      <div className="container-fluid p-4">
        <h1 className="h2 mb-4 fw-bold">Lecturer Dashboard</h1>
        
        <div className="card shadow-sm">
          <div className="card-header">
            <Nav variant="tabs" activeKey={activeDay} onSelect={(k) => setActiveDay(k)}>
              {daysOfWeek.map(day => (
                <Nav.Item key={day}>
                  <Nav.Link eventKey={day}>{day}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>
          <div className="card-body">
            {isLoading ? <p>Loading schedule...</p> : (
              classesForDay.length === 0 ? (
                <p className="text-muted text-center p-3">No classes scheduled for {activeDay}.</p>
              ) : (
                classesForDay.map(s => (
                  <div key={s.id} className="mb-4">
                    <h5>{s.subject_name}</h5>
                    <p className="text-muted">{s.start_time} - {s.end_time}</p>
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th className="text-center">Status</th>
                          <th>Recorded By (CR)</th>
                          <th className="text-center">Excuse</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.attendance_history.length === 0 ? (
                           <tr><td colSpan="5" className="text-center text-muted fst-italic">No attendance records yet for this class.</td></tr>
                        ) : (
                          s.attendance_history.map(att => (
                            <tr key={att.id}>
                              <td>{new Date(att.timestamp).toLocaleDateString()}</td>
                              <td className="text-center">
                                {att.present ? <span className="badge bg-success">Present</span> : <span className="badge bg-danger">Absent</span>}
                              </td>
                              <td>{att.cr_name}</td>
                              <td className="text-center">
                                {att.excuse_file ? <span className="badge bg-info">Submitted</span> : <span className="badge bg-secondary">None</span>}
                              </td>
                              <td className="text-center">
                                {!att.present && !att.excuse_file && (
                                  <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(att)}>
                                    <PencilSquare className="me-1"/> Submit Excuse
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Excuse Upload Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit Excuse</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmitExcuse}>
          <Modal.Body>
            <p className="text-muted">
              For absence recorded on <strong>{new Date(selectedAttendance?.timestamp).toLocaleString()}</strong>
            </p>
            <div className="alert alert-warning d-flex align-items-center">
                <InfoCircleFill className="me-2"/>
                <div>Excuse must be a PDF and submitted within 24 hours of the recorded absence.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="pdfFile" className="form-label"><Upload className="me-2"/>Excuse PDF</label>
              <input type="file" accept="application/pdf" className="form-control" id="pdfFile" onChange={handleFileChange} required/>
            </div>
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">Optional Comment</label>
              <textarea id="comment" className="form-control" value={comment} onChange={(e) => setComment(e.target.value)} rows="3" placeholder="Provide a brief reason..."/>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Submit Excuse'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default LecturerDashboard;