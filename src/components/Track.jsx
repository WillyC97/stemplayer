import React, { useEffect, useRef } from "react";
import classnames from "classnames";
import { PanKnob } from "./Knobs/Knobs";
import ThemedSlider from "./Slider/ThemedSlider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TrackHeader(props) {
  return (
    <div className="track-header">
      <div
        className="drag-handle"
        {...props.attributes}
        {...props.listeners}
        ref={props.activatorRef}
      >
        <svg viewBox="0 0 20 20" width="20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
      </div>
      <div className="track-title">{props.title}</div>
      <div className="track-buttons">
        <div className="track-button mute" onClick={props.onMuteClick}>
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
        <div className="volume-control">
          <ThemedSlider
            min="0"
            max="2"
            step="0.01"
            defaultValue={props.volume}
            onChange={props.onSliderChange}
          />
        </div>
        <div className="pan">
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
        {/* <div
          className="waveform-line"
          style={{ width: props.trackWidth, height: "35px" }}
        ></div> */}
        <div className="waveform-image">
          <img
            src={props.trackWaveform}
            style={{ width: props.trackWidth, height: "70px" }}
          />
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

function SortableTrack({
  track,
  trackWidth,
  seekBarWidth,
  isSoloActive,
  onSeekBarClick,
  onMuteClick,
  onSoloClick,
  onSliderInput,
  onPanSliderInput,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: track.id });
  const style = { transition, transform: CSS.Transform.toString(transform) };
  const title = track.loaded ? track.title : "loading...";
  
  return (
    <div ref={setNodeRef} style={style}>
      <Track
        title={title}
        trackWidth={trackWidth}
        trackWaveform={track.waveform}
        backgroundColour={track.colour}
        seekBarWidth={seekBarWidth}
        muteState={track.muted}
        soloState={track.soloed}
        volume={track.volume}
        pan={track.pan}
        isSoloActive={isSoloActive}
        onSeekBarClick={onSeekBarClick}
        onMuteClick={onMuteClick}
        onSoloClick={onSoloClick}
        onSliderInput={onSliderInput}
        onPanSliderInput={onPanSliderInput}
        activatorRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
      />
    </div>
  );
}

export default SortableTrack;
