import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useDarkMode from '../../useDarkMode'; // Make sure path is correct
import { SunFill, MoonStarsFill } from 'react-bootstrap-icons';

function Navbar() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({ name: '', role: '' });
    const [theme, toggleTheme] = useDarkMode(); // ADD THIS LINE
    
    // ... rest of the component

    // This hook runs when the Navbar is first loaded.
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = parseJwt(token);
            if (user) {
                // We get the user's name and role from the token
                setUserInfo({
                    name: user.full_name,
                    role: user.role
                });
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        // After logging out, clear the user info and navigate to login
        setUserInfo({ name: '', role: '' });
        navigate('/');
    };

    // Helper function to decode the JWT token
    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Determine the correct dashboard link based on the user's role
    const getDashboardPath = () => {
        if (!userInfo.role) return '/';
        return `/${userInfo.role.toLowerCase()}`;
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container-fluid">
                {/* This link now points to the user's specific dashboard */}
                <NavLink className="navbar-brand" to={getDashboardPath()}>LECATS</NavLink>
                <div className="d-flex align-items-center">
                    <div className="form-check form-switch me-3">
                     <input
                            className="form-check-input"
                             type="checkbox"
                             role="switch"
                            id="themeSwitcher"
                            style={{cursor: 'pointer'}}
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                            />
                    <label className="form-check-label text-light" htmlFor="themeSwitcher">
                    {theme === 'dark' ? <MoonStarsFill /> : <SunFill />}
                    </label>
                    </div>
                    {/* This shows a welcome message with the user's name */}
                    {userInfo.name && <span className="navbar-text me-3">Welcome, {userInfo.name}</span>}
                    <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
                    
                    
                </div>
            </div>
        </nav>
    );
}

export default Navbar;