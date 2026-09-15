import React, { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { PanKnob } from "./Knobs/Knobs";
import ThemedSlider from "./Slider/ThemedSlider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TrackHeader(props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(props.title);

  useEffect(() => {
    setDraft(props.title);
  }, [props.title]);

  const canEdit = Boolean(props.onRename) && props.loaded;

  const commit = () => {
    setEditing(false);
    const name = draft.trim();
    if (name && name !== props.title) {
      props.onRename(name);
    } else {
      setDraft(props.title);
    }
  };

  const cancel = () => {
    setDraft(props.title);
    setEditing(false);
  };

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
      {editing ? (
        <input
          className="track-title-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape") cancel();
          }}
        />
      ) : (
        <div
          className="track-title"
          onDoubleClick={canEdit ? () => setEditing(true) : undefined}
          title={canEdit ? "Double-click to rename" : undefined}
        >
          {props.title}
        </div>
      )}
      <div className="track-buttons">
        <div
          className={classnames("track-button mute", {
            "mute-activated": props.muteState,
          })}
          onClick={props.onMuteClick}
        >
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

function MobileTrackControls({
  muteState,
  soloState,
  volume,
  pan,
  onMuteClick,
  onSoloClick,
  onSliderChange,
  onPanChange,
  onCollapse,
}) {
  const stop = (e) => e.stopPropagation();

  return (
    <div className="mobile-track-controls" onClick={onCollapse}>
      <div
        className={classnames("track-button mute", {
          "mute-activated": muteState,
        })}
        onClick={(e) => {
          stop(e);
          onMuteClick();
        }}
      >
        M
      </div>
      <div
        className={classnames("track-button solo", {
          "solo-activated": soloState,
        })}
        onClick={(e) => {
          stop(e);
          onSoloClick();
        }}
      >
        S
      </div>
      <div className="mobile-volume-control" onClick={stop}>
        <ThemedSlider
          min="0"
          max="2"
          step="0.01"
          defaultValue={volume}
          onChange={onSliderChange}
          label="Vol"
        />
      </div>
      <div className="mobile-pan-control" onClick={stop}>
        <ThemedSlider
          min="-1"
          max="1"
          step="0.01"
          defaultValue={pan}
          onChange={(e) => onPanChange(parseFloat(e.target.value))}
          label="Pan"
          bipolar
        />
      </div>
    </div>
  );
}

function Track(props) {
  const t = props.track;
  const title = t ? (t.loaded ? t.title : "loading...") : props.title;
  const loaded = t ? t.loaded : props.loaded;
  const trackWaveform = t ? t.waveform : props.trackWaveform;
  const backgroundColour = t ? t.colour : props.backgroundColour;
  const muteState = t ? t.muted : props.muteState;
  const soloState = t ? t.soloed : props.soloState;
  const volume = t ? t.volume : props.volume;
  const pan = t ? t.pan : props.pan;
  const isMuted = props.isSoloActive ? !soloState : muteState;

  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);

  const handlePointerDown = (e) => {
    if (!props.isMobilePortrait) return;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      props.onSoloClick();
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handlePointerLeave = () => {
    clearTimeout(longPressTimer.current);
  };

  const handlePointerCancel = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleClick = (e) => {
    if (props.isMobilePortrait) {
      if (!didLongPress.current) {
        props.onTapWaveform();
      }
      didLongPress.current = false;
    } else {
      props.onSeekBarClick(e);
    }
  };

  return (
    <div className={classnames("track", { muted: isMuted })}>
      <TrackHeader
        title={title}
        loaded={loaded}
        muteState={muteState}
        soloState={soloState}
        volume={volume}
        pan={pan}
        onMuteClick={props.onMuteClick}
        onSoloClick={props.onSoloClick}
        onRename={props.onRename}
        onSliderChange={props.onSliderInput}
        onPanSliderChange={props.onPanSliderInput}
        activatorRef={props.activatorRef}
        attributes={props.attributes}
        listeners={props.listeners}
      />
      <div
        className="track-audio"
        style={{ backgroundColor: backgroundColour }}
      >
        {props.isMobilePortrait && !props.isExpanded && (
          <div className="track-title-overlay">{title}</div>
        )}
        <div className="waveform-image">
          <img
            src={trackWaveform}
            alt={`${title} waveform`}
            draggable={false}
            style={{
              width: props.trackWidth,
              height: "70px",
              WebkitTouchCallout: "none",
              pointerEvents: props.isMobilePortrait ? "none" : undefined,
            }}
          />
        </div>
        <div className="track-seek-bar" />
        {props.isMobilePortrait && props.isExpanded && (
          <MobileTrackControls
            muteState={muteState}
            soloState={soloState}
            volume={volume}
            pan={pan}
            onMuteClick={props.onMuteClick}
            onSoloClick={props.onSoloClick}
            onSliderChange={props.onSliderInput}
            onPanChange={props.onPanSliderInput}
            onCollapse={props.onTapWaveform}
          />
        )}
        <div
          className="waveform-click-target"
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerCancel}
          style={{
            width: props.trackWidth,
            touchAction: props.isMobilePortrait ? "pan-y" : undefined,
          }}
        />
      </div>
    </div>
  );
}

function SortableTrack({
  track,
  trackWidth,
  isSoloActive,
  onSeekBarClick,
  onMuteClick,
  onSoloClick,
  onRename,
  onSliderInput,
  onPanSliderInput,
  isMobilePortrait,
  isExpanded,
  onTapWaveform,
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
        loaded={track.loaded}
        trackWidth={trackWidth}
        trackWaveform={track.waveform}
        backgroundColour={track.colour}
        muteState={track.muted}
        soloState={track.soloed}
        volume={track.volume}
        pan={track.pan}
        isSoloActive={isSoloActive}
        onSeekBarClick={onSeekBarClick}
        onMuteClick={onMuteClick}
        onSoloClick={onSoloClick}
        onRename={onRename}
        onSliderInput={onSliderInput}
        onPanSliderInput={onPanSliderInput}
        activatorRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
        isMobilePortrait={isMobilePortrait}
        isExpanded={isExpanded}
        onTapWaveform={onTapWaveform}
      />
    </div>
  );
}

export { Track };
export default SortableTrack;
