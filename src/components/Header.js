import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';
import './Header.css'

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  return (
    <>
      <nav className="header-nav">
        {userLoggedIn ? (
          <button
            onClick={() => {
              doSignOut().then(() => {
                navigate('/login');
              });
            }}
            className="header-nav-button"
          >
            Logout
          </button>
        ) : (
          <>
            <Link className="header-nav-link" to={'/login'}>
              Login
            </Link>
            <Link className="header-nav-link" to={'/register'}>
              Register New Account
            </Link>
          </>
        )}
      </nav>
    </>
  );
};

export default Header;