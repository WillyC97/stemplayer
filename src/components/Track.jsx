import React, { useEffect, useRef } from "react";
import classnames from "classnames";
import { PanKnob } from "./Knobs/Knobs";

function TrackHeader(props) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.value = props.volume;
  }, [props.volume]);

  return (
    <div className="track-header">
      <div className="track-title">{props.title}</div>

      <div className="track-buttons">
        <div className="track-button left mute" onClick={props.onMuteClick}>
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
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={props.volume}
          onChange={props.onSliderChange}
        />
        <PanKnob value={props.pan} onChange={props.onPanSliderChange} />
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
      />
      <div
        className="track-audio"
        style={{ backgroundColor: props.backgroundColour }}
      >
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
