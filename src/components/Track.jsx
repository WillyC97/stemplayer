import React from 'react';

function TrackHeader(props) {
    return (
        <div className='track-header'>
            <div className="track-title">{props.title}</div>
            <div className="track-buttons">
               <div className="track-button left mute">M</div>
               <div className="track-button solo">S</div>
            </div>
        </div>
    );
}

function Track(props) {
    return (
        <div className='track'>
            <TrackHeader title="Track 1"/>
            <div className="track-audio" style={{backgroundColor: props.backgroundColour}}/>
        </div>
    );
}

export default Track;