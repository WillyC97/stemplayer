import React from 'react';

function Track(props) {
    return (
        <div className='track'>
        <div className="track-audio" style={{backgroundColor: props.backgroundColour}}/>
        </div>
    );
}

function App() {
    return (
        <div className='d-flex flex-row'>
          <div className='flex-grow-1 flex-shrink-0'>
            <Track backgroundColour="#ad1b1b"/>
            <Track backgroundColour="#10e8cf"/>
          </div>
        </div>
    );
}