// AuthGuard.jsx (Protect dashboards)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ role, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== role) navigate('/');
  }, [navigate, role]);

  return children;
};

export default AuthGuard;