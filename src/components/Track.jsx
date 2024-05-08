import React, { useEffect, useRef } from "react";
import classnames from "classnames";
import { PanKnob } from "./Knobs/Knobs";
import ThemedSlider from "./Slider/ThemedSlider";

function TrackHeader(props) {

  return (
    <div className="track-header">
      <div className="track-title">{props.title}</div>

      <div className="track-buttons">
        <div className="track-button mute" {...props.attributes} {...props.listeners} ref={props.activatorRef}>
        {/* <div className="track-button mute" onClick={props.onMuteClick}> */}
          M
        </div>
        <div
          className={classnames("track-button solo", {
            "solo-activated": props.soloState,
          })}
          onClick={props.onSoloClick}
        >
          S
        </div>
        <div className="volume-control" >
        <ThemedSlider 
          min="0"
          max="2"
          step="0.01"
          defaultValue={1}
          onChange={props.onSliderChange}
        />
        </div>
        <div className="pan" >
        <PanKnob value={props.pan} onChange={props.onPanSliderChange} />
        </div>
      </div>
    </div>
  );
}

function Track(props) {
  const isMuted = props.isSoloActive ? !props.soloState : props.muteState;

  return (
    <div className={classnames("track", { muted: isMuted })}>
      <TrackHeader
        title={props.title}
        soloState={props.soloState}
        volume={props.volume}
        pan={props.pan}
        onMuteClick={props.onMuteClick}
        onSoloClick={props.onSoloClick}
        onSliderChange={props.onSliderInput}
        onPanSliderChange={props.onPanSliderInput}
        activatorRef={props.activatorRef}
        attributes={props.attributes}
        listeners={props.listeners}
      />
      <div
        className="track-audio"
        style={{ backgroundColor: props.backgroundColour }}
      >
        <div className="waveform-line"
        style={{ width: props.trackWidth, height: "35px"}}>
        </div>
        <div className="waveform-image">
        <img src={require('./WAveform.png')} 
        style={{ width: props.trackWidth, height: "70px"}} />
        </div>
        <div className="track-seek-bar" style={{ width: props.seekBarWidth }} />
        <div
          className="waveform-click-target"
          onClick={(e) => props.onSeekBarClick(e)}
          style={{ width: props.trackWidth }}
        />
      </div>
    </div>
  );
}

export default Track;
