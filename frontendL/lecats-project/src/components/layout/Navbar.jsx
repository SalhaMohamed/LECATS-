import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">LECATS</NavLink>
                <div className="d-flex">
                    <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;