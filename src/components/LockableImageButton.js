import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'; // For Cloud Firestore
import { getAuth } from 'firebase/auth';
import './LockableImageButton.css';

const db = getFirestore();
const auth = getAuth();

const LockableImageButton = ({ buttonName, imageUrl, password, onUnlock }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const containerRef = useRef(null);

  const handleUnlock = async () => {
    if (inputPassword === password) {
      setIsLocked(false);
      setShowPasswordInput(false);
      setInputPassword('');
      onUnlock(buttonName);

      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'unlocks', buttonName), {
          unlocked: true,
        });
      }
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

  useEffect(() => {
    const fetchUnlockStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'unlocks', buttonName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().unlocked) {
          setIsLocked(false);
        }
      }
    };

    fetchUnlockStatus();
  }, [buttonName]);

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