import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/ChoirCo/ChoirCo.css';
import backgroundImage from './assets/ChoirCoBackground.jpg';

const HomeComponent = () => {
  const buttonStyle = {
    display: 'inline-block',
    padding: '15px 20px',
    margin: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'white',
    backgroundColor: 'rgba(120, 120, 120, 0.5)',
    borderRadius: '5px',
    hover: { backgroundColor: 'rgb(240, 240, 240)' }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
  };

  const backgroundStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    filter: `blur(5px)`,
    zIndex: `-1`
};

  return (
    <div className="background-container">
      <div style={backgroundStyle}></div>
      <div className="content">
        <div style={containerStyle}>
          <Link to="/ChoirCo" style={buttonStyle}>ChoirCo</Link>
          <Link to="/TurdStory" style={buttonStyle}>TurdStory</Link>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
