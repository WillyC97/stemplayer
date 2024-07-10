import React from 'react';
import { Link } from 'react-router-dom';

const HomeComponent = () => {
  const buttonStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    margin: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'white',
    backgroundColor: 'blue',
    borderRadius: '5px',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
  };

  return (
    <div style={containerStyle}>
      <Link to="/walkinOnSunshine" style={buttonStyle}>Go to Page 1</Link>
    </div>
  );
};

export default HomeComponent;
