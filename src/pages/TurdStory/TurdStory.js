import React from 'react';
import { Link } from 'react-router-dom';
import '../ArtistPage.css';

const TurdStoryPage = () => {

  const backgroundColor = 'rgba(252, 140, 3, 0.8)';

  return (
    <div className="artist-page-background-container">
      <div 
      className='artist-page-background-style' 
      style={{ backgroundColor: backgroundColor }}
      ></div>
      <div className="artist-page-content">
        <div className="artist-page-content-style">
          <div className='artist-page-dark-block' >
            <div className='artist-page-song-group-header'>
              <div className='artist-page-text'> {"Learning Tracks"} </div>
            </div>
            <div className='artist-page-song-group-container' >
              <Link to="/TurdStory/oneLastTime" className="artist-page-button-style">One Last Time</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurdStoryPage;
