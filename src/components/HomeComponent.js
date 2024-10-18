import React from 'react';
import { Link } from 'react-router-dom';
import './HomeComp.css';
import ChoirCoImg from './assets/ChoirCoLogo.png';
import TurdStoryImg from './assets/TurdStory.jpg'; 

const HomeComponent = () => {
  return (
    <div className="home-background-container">
      <div className="home-background-style"></div>
      <div className="home-content">
        <div className="home-container-style">
          <Link to="/ChoirCo" className="home-button-container">
            <div 
              className="home-button-style" 
              style={{ backgroundImage: `url(${ChoirCoImg})` }}>
            </div>
            <div className="home-text-style">ChoirCo</div>
          </Link>
          <Link to="/TurdStory" className="home-button-container">
            <div 
              className="home-button-style" 
              style={{ backgroundImage: `url(${TurdStoryImg})` }}>
            </div>
            <div className="home-text-style">TurdStory</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
