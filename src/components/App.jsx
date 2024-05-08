import React from "react";
import Track from "./Track";
import { useState, useEffect, useRef } from "react";
import useWindowDimensions from "../utils/WindowDimensions";
import { secondsToMinutes } from "../utils/time";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {CSS} from "@dnd-kit/utilities";

// import Rave from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Bass.mp3";
// import Vibe from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Solo.mp3";
// import Running from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/VP.mp3";

const TRACK_HEADER_WIDTH = 300;

//=========================================================================

function App() {
  const { height, width } = useWindowDimensions();

  const requestRef = useRef();
  const previousTimeRef = useRef();
  const timingRef = useRef({ lastTimeStamp: 0.0, currentTime: 0.0 });
  const trackLengthRef = useRef(0.0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [seekBarWidth, setSeekbarWidth] = useState(0);
  const [stems, updateStemState] = useState(window.songInfo || []);

  //=========================================================================
  // Helpers
  //-----------------------------------------------------------------------

  function SortableTrack({ track }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
      useSortable({ id: track.id });
      const style = {transition, transform:CSS.Transform.toString(transform)};
    return (
      <div ref={setNodeRef} style={style}>
      <Track 
        key={track.id}
        track={track}
        title={track.title}
        trackWidth={width - TRACK_HEADER_WIDTH}
        backgroundColour={track.colour}
        seekBarWidth={seekBarWidth + "px"}
        muteState={track.muted}
        soloState={track.soloed}
        volume={track.volume}
        pan={track.pan}
        isSoloActive={isSoloActive()}
        onSeekBarClick={(e) => onSeekBarClick(e)}
        onMuteClick={() => toggleStemMute(track.uuid)}
        onSoloClick={() => toggleStemSolo(track.uuid)}
        onSliderInput={(e) => setStemVolume(e, track.gainNode, track.uuid)}
        onPanSliderInput={(newValue) =>
          setStemPan(newValue, track.panNode, track.uuid)
        }
        activatorRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
      />
      </div>
    );
  };

  function isSoloActive() {
    return stems.some((stem) => stem.soloed);
  }
  //-----------------------------------------------------------------------

  function findStem(trackUUID) {
    return stems.find((data) => data.uuid === trackUUID);
  }
  //-----------------------------------------------------------------------

  function updateStemParameter(trackUUID, key, value) {
    const stem = findStem(trackUUID);
    if (!stem) {
      console.error(`No audio source found with id ${trackUUID}`);
      return;
    }

    stem[key] = value;
    updateStemState(
      stems.map((data) =>
        data.uuid === trackUUID ? { ...data, [key]: value } : data
      )
    );
  }

  function renderTime()
  {
    let currentTime = "";
    let totalTime = "";
    if (trackLengthRef.current > 0)
    {
      currentTime = secondsToMinutes(timingRef.current.currentTime);
      totalTime = secondsToMinutes(trackLengthRef.current);
    }

    return currentTime + " / " + totalTime;
  }

  //=========================================================================
  // Loading
  //-----------------------------------------------------------------------

  useEffect(() => {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ac);

    Promise.all(
      stems.map((stem, index) =>
        fetch(stem.file)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => ac.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            return {
              ...stem,
              id: index + 1,
              buffer: audioBuffer,
              audioLength: audioBuffer.duration,
              audioSource: null,
              gainNode: null,
              panNode: null,
              volume: 1.0,
              pan: 0.0,
              muted: false,
              soloed: false,
              uuid: crypto.randomUUID(),
            };
          })
      )
    ).then((initialisedStems) => {
      trackLengthRef.current = Math.max(
        ...initialisedStems.map((stem) => stem.audioLength || 0)
      );
      updateStemState(initialisedStems);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        onPlayPause();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, stems]);

  //=========================================================================
  // Play/Pause
  //-----------------------------------------------------------------------

  const onPlayPause = () => {
    isPlaying ? pauseAudio() : playAudio();
  };
  //-----------------------------------------------------------------------

  function playAudio() {
    const newTracks = stems.map(async (stem) => {
      let source = null;
      let gain = null;
      let pan = null;
      if (stem.buffer) {
        source = audioContext.createBufferSource();
        gain = audioContext.createGain();
        pan = audioContext.createStereoPanner();
        setStemGainNodeState(stem.uuid, gain);
        setStemPanNodeState(stem.uuid, pan);
        source.buffer = stem.buffer;
        source.connect(gain);
        gain.connect(pan);
        pan.connect(audioContext.destination);
      }
      return { ...stem, audioSource: source, gainNode: gain, panNode: pan };
    });

    Promise.all(newTracks).then((updatedStems) => {
      updateStemState(updatedStems);
      updatedStems.forEach((stem) => {
        stem.audioSource.start(0.02, timingRef.current.currentTime);
      });
      setIsPlaying(true);
      timingRef.current.lastTimeStamp = audioContext.currentTime;
      requestRef.current = requestAnimationFrame(clockTick);
    });
  }
  //-----------------------------------------------------------------------

  function pauseAudio() {
    stems.forEach((stem) => {
      stem.audioSource.stop();
    });

    cancelAnimationFrame(requestRef.current);
    setIsPlaying(false);
  }

  //=========================================================================
  // Mute/Solo
  //-----------------------------------------------------------------------

  function toggleStemMute(trackUUID) {
    const stem = findStem(trackUUID);
    if (!stem) return;

    updateStemParameter(stem.uuid, "muted", !stem.muted);
    setStemGainNodeState(stem.uuid, stem.gainNode);
  }
  //-----------------------------------------------------------------------

  function toggleStemSolo(trackUUID) {
    const stem = findStem(trackUUID);
    if (!stem) return;

    updateStemParameter(trackUUID, "soloed", !stem.soloed);
    setStemGainNodeState(stem.uuid, stem.gainNode);

    stems.forEach((stem) => {
      setStemGainNodeState(stem.uuid, stem.gainNode);
    });
  }
  //-----------------------------------------------------------------------

  function setStemGainNodeState(stemUUID, gainNode) {
    const stem = findStem(stemUUID);
    if (!stem || !gainNode) return;

    gainNode.gain.value =
      stem.muted || (!stem.soloed && isSoloActive()) ? 0 : stem.volume;
  }

  function setStemPanNodeState(stemUUID, panNode) {
    const stem = findStem(stemUUID);
    if (!stem || !panNode) return;

    panNode.pan.setValueAtTime(stem.pan, audioContext.currentTime);
  }

  function setStemVolume(element, gainNode, stemUUID) {
    const volume = element.target.value;

    updateStemParameter(stemUUID, "volume", volume);
    setStemGainNodeState(stemUUID, gainNode);
  }

  function setStemPan(pan, panNode, stemUUID) {
    updateStemParameter(stemUUID, "pan", pan);
    setStemPanNodeState(stemUUID, panNode);
  }

  //=========================================================================
  // Seekbar
  //-----------------------------------------------------------------------

  function onSeekBarClick(e) {
    const percentage =
      (e.clientX - TRACK_HEADER_WIDTH) / (width - TRACK_HEADER_WIDTH);
    jumpToTime(percentage * trackLengthRef.current, isPlaying);
  }
  //-----------------------------------------------------------------------

  function updateSeekBar() {
    setSeekbarWidth(
      (timingRef.current.currentTime / trackLengthRef.current) *
        (width - TRACK_HEADER_WIDTH)
    );
  }

  //=========================================================================
  // Clock/timing
  //-----------------------------------------------------------------------

  const clockTick = (time) => {
    const timeChange =
      audioContext.currentTime - timingRef.current.lastTimeStamp;

    timingRef.current = {
      lastTimeStamp: audioContext.currentTime,
      currentTime: timingRef.current.currentTime + timeChange,
    };

    if (timingRef.current.currentTime >= trackLengthRef.current) {
      pauseAudio();
      jumpToTime(0.0, false);
      return;
    }

    if (previousTimeRef.current != undefined) {
      updateSeekBar();
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(clockTick);
  };

  function jumpToTime(time, wasPlaying) {
    if (wasPlaying) pauseAudio();
    timingRef.current.currentTime = time;
    updateSeekBar();
    if (wasPlaying) playAudio();
  }

  const handleDragEnd = (event) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      const activeIndex = stems.findIndex((stem) => stem.id === active.id);
      const overIndex = stems.findIndex((stem) => stem.id === over.id);
      const newStems = [...stems];
      newStems.splice(overIndex, 0, newStems.splice(activeIndex, 1)[0]);
      updateStemState(newStems);
    }
  };

  //=========================================================================
  //  Render
  //-----------------------------------------------------------------------

  return (
    <div>
      <div className="page-header">
        <div className="btn">
          {isPlaying ? (
            <div class="pause-button" onClick={() => onPlayPause()}>
              <i class="fas fa-pause"></i>
            </div>
          ) : (
            <div class="play-button" onClick={() => onPlayPause()}>
              <i class="fas fa-play"></i>
            </div>
          )}
        </div>
        <div className="time">{renderTime()}</div>
        <div className="song-title">{"Song"}</div>
      </div>
      <DndContext modifiers={[restrictToVerticalAxis]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stems} strategy={verticalListSortingStrategy}>
          {stems.map((track) => (
            <SortableTrack track={track} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
