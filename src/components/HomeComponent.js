import React from 'react';
import './HomeComp.css';
import Header from './Header';
import LockableImageButton from './LockableImageButton';
import { catalog } from '../catalog';

const HomeComponent = () => {
  const handleUnlock = (buttonName) => {
    console.log(`${buttonName} unlocked`);
  };

  return (
    <div className="home-background-container">
      <div className="home-background-style"></div>
      <div className="home-content">
        <div className="home-container-style">
          <Header />
          {catalog.map((artist) => (
            <LockableImageButton
              key={artist.key}
              buttonName={artist.key}
              imageUrl={artist.logo}
              password={artist.password}
              onUnlock={handleUnlock}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
