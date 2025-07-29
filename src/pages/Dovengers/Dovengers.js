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
        {/* ----------------------------------------------------------------------------------------------------- */}
          <div className='artist-page-dark-block' >
            <div className='artist-page-song-group-header'>
              <div className='artist-page-text'> {"Learning Tracks - Performed"} </div>
            </div>
            <div className='artist-page-song-group-container' >
              <Link to="/Dovengers/rockWithYou" className="artist-page-button-style">Rock with You</Link>
              <Link to="/Dovengers/rosanna" className="artist-page-button-style">Rosanna</Link>
              <Link to="/Dovengers/myLife" className="artist-page-button-style">My Life</Link>
              <Link to="/Dovengers/smackDown" className="artist-page-button-style">Smack Down</Link>
              <Link to="/Dovengers/smileOnYourFace" className="artist-page-button-style">Smile On Your Face</Link>
              <Link to="/Dovengers/peg" className="artist-page-button-style">Peg</Link>
            </div>
          </div>

          {/*--------------------------------New for Murphys------------------------------*/}
          <div className='artist-page-dark-block' >
            <div className='artist-page-song-group-header'>
              <div className='artist-page-text'> {"Learning Tracks - Murphys 2025"} </div>
            </div>
            <div className='artist-page-song-group-container' >
              <Link to="/Dovengers/girlIsMine" className="artist-page-button-style">Girl Is Mine</Link>
              <Link to="/Dovengers/kissFromARose" className="artist-page-button-style">Kiss From a Rose</Link>
              <Link to="/Dovengers/holdTheLine" className="artist-page-button-style">Hold the Line</Link>
              <Link to="/Dovengers/youCanCallMeAl" className="artist-page-button-style">You Can Call Me Al</Link>
              <Link to="/Dovengers/twistAndShout" className="artist-page-button-style">Twist and Shout</Link>
              <Link to="/Dovengers/freedom" className="artist-page-button-style">Freedom</Link>
              <Link to="/Dovengers/sledgehammer" className="artist-page-button-style">Sledgehammer</Link>
              <Link to="/Dovengers/easy" className="artist-page-button-style">Easy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DovengersPage;
