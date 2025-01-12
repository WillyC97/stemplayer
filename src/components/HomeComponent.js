import React from 'react';
import './HomeComp.css';
import Header from './Header';
import ChoirCoImg from './assets/ChoirCoLogo.png';
import TurdStoryImg from './assets/TurdStory.jpg';
import LockableImageButton from './LockableImageButton';

const HomeComponent = () => {
  const passwords = { ChoirCo: 'password1', TurdStory: 'turds' }; // Replace with actual passwords

  const handleUnlock = (buttonName) => {
    console.log(`${buttonName} unlocked`);
  };

  return (
    <div className="home-background-container">
      <div className="home-background-style"></div>
      <div className="home-content">
        <div className="home-container-style">
          <Header />
          <LockableImageButton 
            buttonName="ChoirCo" 
            imageUrl={ChoirCoImg} 
            password={passwords.ChoirCo} 
            onUnlock={handleUnlock} 
          />
          <LockableImageButton 
            buttonName="TurdStory" 
            imageUrl={TurdStoryImg} 
            password={passwords.TurdStory} 
            onUnlock={handleUnlock} 
          />
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;