import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LockableImageButton.css';

const LockableImageButton = ({ buttonName, imageUrl, password, onUnlock }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const containerRef = useRef(null);

  const handleUnlock = () => {
    if (inputPassword === password) {
      setIsLocked(false);
      setShowPasswordInput(false);
      setInputPassword('');
      onUnlock(buttonName);
    } else {
      alert('Incorrect password');
      setInputPassword('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleUnlock();
    }
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setShowPasswordInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="lockable-button-wrapper">
      {isLocked ? (
        <div className="lockable-button-container">
          <div 
            className="lockable-button-style locked" 
            style={{ backgroundImage: `url(${imageUrl})` }}>
            <i 
              className="fa-solid fa-lock lock-icon" 
              onClick={() => setShowPasswordInput(true)}
            ></i>
          </div>
          <div className="lockable-button-text-style">{buttonName}</div>
        </div>
      ) : (
        <Link to={`/${buttonName}`} className="lockable-button-container">
          <div 
            className="lockable-button-style unlocked" 
            style={{ backgroundImage: `url(${imageUrl})` }}>
          </div>
          <div className="lockable-button-text-style">{buttonName}</div>
        </Link>
      )}
      {showPasswordInput && (
        <div className="password-input-container" ref={containerRef}>
          <input 
            type="password" 
            value={inputPassword} 
            onChange={(e) => setInputPassword(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Enter password"
          />
          <button onClick={handleUnlock}>Unlock</button>
        </div>
      )}
    </div>
  );
};

export default LockableImageButton;