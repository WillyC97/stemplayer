import React from 'react';

function Track(props) {
    return (
        <div className='track'>
        <div className="track-audio" style={{backgroundColor: props.backgroundColour}}/>
        </div>
    );
}

export default Track;