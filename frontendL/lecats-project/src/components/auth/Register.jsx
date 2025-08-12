import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import api from '../../api'; // Using our central api instance

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CR');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/api/departments');
        setDepartments(res.data);
      } catch (error) {
        toast.error("Could not load departments");
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password, // No trim on password
        role,
        department_id: departmentId
      });
      toast.success('Registered successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg" style={{ width: '25rem' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center fw-bold mb-4">Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
              <label htmlFor="fullName">Full Name</label>
            </div>

            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <label htmlFor="email">Email address</label>
            </div>
            
            <div className="form-floating mb-3">
              <select className="form-select" id="role" value={role} onChange={e => setRole(e.target.value)} required>
                <option value="CR">Class Representative</option>
                <option value="Lecturer">Lecturer</option>
                <option value="HOD">Head of Department</option>
              </select>
              <label htmlFor="role">Select your role</label>
            </div>

            <div className="form-floating mb-3">
              <select className="form-select" id="department" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
                <option value="" disabled>-- Select Department --</option>
                {departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
              </select>
              <label htmlFor="department">Select Department</label>
            </div>

            <div className="form-floating mb-4 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                // ADDED: Password validation pattern and title
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$"
                title="Password must be 6-10 characters and include an uppercase, lowercase, number, and special character."
              />
              <label htmlFor="password">Password</label>
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-3" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <EyeSlashFill size={20} /> : <EyeFill size={20} />}
              </span>
            </div>

            <div className="d-grid">
              <button className="btn btn-primary btn-lg" type="submit">Register</button>
            </div>
          </form>

          <div className="text-center mt-4">
            <small>Already have an account? <Link to="/login">Login here</Link></small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;