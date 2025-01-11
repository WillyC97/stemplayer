// src/Register.js
import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../firebase/auth';
import './SignInComp.css';

const Register = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { userLoggedIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(email, password);
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={'/home'} replace={true} />}

      <main className="signin-main-container">
        <div className="signin-form-container">
            <div className="signin-text-center">
                <div className="signin-mt-2">
                    <h3 className="signin-welcome-text">Create New Account</h3>
                </div>
            </div>
          <form onSubmit={onSubmit} className="signin-form">
            <div>
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signin-input-style"
              />
            </div>

            <div>
              <label>Password</label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signin-input-style"
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="off"
                required
                value={confirmPassword}
                onChange={(e) => setconfirmPassword(e.target.value)}
                className="signin-input-style"
              />
            </div>

            {errorMessage && <span className="signin-error-message">{errorMessage}</span>}

            <button
              type="submit"
              disabled={isRegistering}
              className={`signin-submit-button ${isRegistering ? 'disabled' : ''}`}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            <p className="signin-signup-text">Already have an account? <Link to={'/login'} className="signin-signup-link">Continue</Link></p>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;