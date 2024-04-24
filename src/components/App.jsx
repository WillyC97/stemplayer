import React from "react";
import Track from "./Track";
import { useState, useEffect, useRef } from "react";
import useWindowDimensions from "../utils/WindowDimensions";

import Rave from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Bass.mp3";
import Vibe from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Solo.mp3";
import Running from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/VP.mp3";

const TRACK_HEADER_WIDTH = 250;

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
  const [stems, updateStemState] = useState([
    {
      title: "Rave Digger",
      file: Rave,
      colour: "#ad1b1b",
      buffer: null,
      audioSource: null,
      audioLength: null,
      gainNode: null,
      panNode: null,
      volume: 1.0,
      pan: 0.0,
      muted: false,
      soloed: false,
    },
    {
      title: "80s Vibe",
      file: Vibe,
      colour: "#10e8cf",
      buffer: null,
      audioSource: null,
      audioLength: null,
      gainNode: null,
      panNode: null,
      volume: 1.0,
      pan: 0.0,
      muted: false,
      soloed: false,
    },
    {
      title: "Running Out",
      file: Running,
      colour: "#a432a8",
      buffer: null,
      audioSource: null,
      audioLength: null,
      gainNode: null,
      panNode: null,
      volume: 1.0,
      pan: 0.0,
      muted: false,
      soloed: false,
    },
  ]);

  //=========================================================================
  // Helpers
  //-----------------------------------------------------------------------

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

  //=========================================================================
  // Loading
  //-----------------------------------------------------------------------

  useEffect(() => {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ac);

    Promise.all(
      stems.map((stem) =>
        fetch(stem.file)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => ac.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            return {
              ...stem,
              buffer: audioBuffer,
              audioLength: audioBuffer.duration,
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
        source.buffer = stem.buffer;
        source.connect(gain);
        gain.connect(pan);
        pan.connect(audioContext.destination);
        setStemGainNodeState(stem.uuid, gain);
        setStemPanNodeState(stem.uuid, pan);
      }
      return { ...stem, audioSource: source, gainNode: gain, panNode: pan };
    });

    Promise.all(newTracks).then((updatedStems) => {
      updateStemState(updatedStems);
      setIsPlaying(true);
      updatedStems.forEach((stem) => {
        stem.audioSource.start(0.02, timingRef.current.currentTime);
      });
      timingRef.current.lastTimeStamp = audioContext.currentTime;
      requestRef.current = requestAnimationFrame(clockTick);
    });
  }
  //-----------------------------------------------------------------------

  function pauseAudio() {
    stems.forEach((stem) => {
      stem.audioSource.stop();
    });

    setIsPlaying(false);
    cancelAnimationFrame(requestRef.current);
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

    panNode.pan.setValueAtTime(stem.pan, timingRef.current.currentTime);
  }

  function setStemVolume(element, gainNode, stemUUID)
  {
    if (!gainNode) return;
    
    const volume = element.target.value;
    
    gainNode.gain.value = volume;
    updateStemParameter(stemUUID, "volume", volume);

  function setStemPan(pan, panNode, stemUUID)
  {
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

  //=========================================================================
  //  Render
  //-----------------------------------------------------------------------

  return (
    <div>
      <div className="black-bar d-flex flex-row">
        <div className="btn">
          {isPlaying ? (
            <div id="pause-button" onClick={() => onPlayPause()} />
          ) : (
            <div id="play-button" onClick={() => onPlayPause()} />
          )}
        </div>
      </div>
      <div className="d-flex flex-row">
        <div className="flex-grow-1 flex-shrink-0">
          {stems.map((track) => (
            <Track
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
              onPanSliderInput={(newValue) => setStemPan(newValue, track.panNode, track.uuid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
