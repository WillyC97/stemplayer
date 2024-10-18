import React from 'react';
import { Link } from 'react-router-dom';
import '../ArtistPage.css';
import ChoirCoBackground from '../../components/assets/ChoirCoBackground.jpg';

const ChoirCoPage = () => {

  const backgroundImage = `url(${ChoirCoBackground})`;

  return (
    <div className="artist-page-background-container">
      <div 
      className='artist-page-background-style' 
      style={{ backgroundImage: backgroundImage }}
      ></div>
      <div className="artist-page-content">
        <div className="artist-page-content-style">
{/*--------------------------------Mixed songs------------------------------*/}
          <div className='artist-page-dark-block' >
            <div className='artist-page-song-group-header'>
              <div className='artist-page-text'> {"Season 6 - Mixed"} </div>
            </div>
            <div className='artist-page-song-group-container' >
              <Link to="/ChoirCo/walkinOnSunshine" className="artist-page-button-style">Walkin' On Sunshine</Link>
              <Link to="/ChoirCo/exile" className="artist-page-button-style">Exile</Link>
              <Link to="/ChoirCo/exile" className="artist-page-button-style">Another song</Link>
            </div>
          </div>
{/*--------------------------------Women songs ------------------------------*/}
         <div className='artist-page-dark-block' >
            <div className='artist-page-songGroupHeader'>
              <div className='artist-page-text'> {"Season 6 - Women"} </div>
            </div>
            <Link to="/ChoirCo/walkinOnSunshine" className="artist-page-button-style">Walkin' On Sunshine</Link>
            <Link to="/ChoirCo/exile" className="artist-page-button-style">Exile</Link>
            <Link to="/ChoirCo/exile" className="artist-page-button-style">Another song</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoirCoPage;
