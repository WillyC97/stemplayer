// src/components/AuthWrapper.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const AuthWrapper = ({ children }) => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/login');
    }
  }, [userLoggedIn, navigate]);

  if (!userLoggedIn) {
    return null; // or a loading spinner, or a message indicating redirection
  }

  return <>{children}</>;
};

export default AuthWrapper;