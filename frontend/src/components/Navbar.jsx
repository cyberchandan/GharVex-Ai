import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span>Gharvex</span> Ai
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            {user.role === 'user' && (
              <Link to="/chat" className="btn btn-primary">Start New Project</Link>
            )}
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login / Register</Link>
            <Link to="/chat" className="btn btn-primary">Try AI Constructor</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
