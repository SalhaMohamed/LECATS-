import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Import the eye icons
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // NEW STATE: To manage password visibility
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  // Your handleSubmit and parseJwt functions remain the same
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      toast.success('Login Successful');

      const user = parseJwt(res.data.token);
      if (!user) {
        toast.error('Invalid token received.');
        return;
      }
      
      switch (user.role) {
        case 'CR': navigate('/cr'); break;
        case 'Lecturer': navigate('/lecturer'); break;
        case 'HOD': navigate('/hod'); break;
        case 'Admin': navigate('/admin'); break;
        default: toast.error('Invalid user role'); navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Invalid email or password');
    }
  };

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg" style={{ width: '25rem' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center fw-bold mb-4">Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            
            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <label htmlFor="email">Email address</label>
            </div>

            {/* MODIFIED PASSWORD INPUT */}
            <div className="form-floating mb-4 position-relative">
              <input
                type={showPassword ? "text" : "password"} // Dynamic type
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
              {/* Eye icon button */}
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-3" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <EyeSlashFill size={20} /> : <EyeFill size={20} />}
              </span>
            </div>

            <div className="d-grid">
              <button className="btn btn-primary btn-lg" type="submit">Login</button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <small>Don’t have an account? <Link to="/register">Register here</Link></small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;