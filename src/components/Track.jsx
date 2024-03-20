import React from 'react';

function TrackHeader(props) {
    return (
        <div className='track-header'>
            <div className="track-title">{props.title}</div>
           
            <div className="track-buttons">
               <div className="track-button left mute">M</div>
               <div className="track-button solo">S</div>
               <input type="range" min="1" max="100" value="50" />
            </div>
        </div>
    );
}

function Track(props) {
    return (
        <div className='track'>
            <TrackHeader title={props.title}/>
            <div className="track-audio" style={{backgroundColor: props.backgroundColour}}>
                <div className='track-seek-bar' style={{width: props.seekBarWidth }} />
                <div className="waveform-click-target" onClick={(e) => props.onSeekBarClick(e)} style={{width: props.trackWidth}}/>
            </div>
        </div>
    );
}

export default Track;