import React from 'react';
import { Link } from 'react-router-dom';
import DovengersBackground from '../../components/assets/BOTB22_Final-296.jpg';
import '../ArtistPage.css';

const DovengersPage = () => {

    const backgroundImage = `url(${DovengersBackground})`;

  return (
    <div className="artist-page-background-container">
      <div 
      className='artist-page-background-style' 
      style={{ backgroundImage: backgroundImage }}
      ></div>
      <div className="artist-page-content">
        <div className="artist-page-content-style">
          <div className='artist-page-dark-block' >
            <div className='artist-page-song-group-header'>
              <div className='artist-page-text'> {"Learning Tracks"} </div>
            </div>
            <div className='artist-page-song-group-container' >
              <Link to="/Dovengers/kissFromARose" className="artist-page-button-style">Kiss From a Rose</Link>
              <Link to="/Dovengers/rockWithYou" className="artist-page-button-style">Rock with You</Link>
              <Link to="/Dovengers/rosanna" className="artist-page-button-style">Rosanna</Link>
              <Link to="/Dovengers/myLife" className="artist-page-button-style">My Life</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DovengersPage;
