import React from "react";
import Track from "./Track";
import { useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import useWindowDimensions from "../utils/WindowDimensions";

import Rave from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Bass.mp3";
import Vibe from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Solo.mp3";
import Running from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/VP.mp3";

const TRACK_HEADER_WIDTH = 200;

function App() {
  const { height, width } = useWindowDimensions();

  const requestRef = useRef();
  const previousTimeRef = useRef();
  const timingRef = useRef({ lastTimeStamp: 0.0, currentTime: 0.0 });

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
      gainNode: null,
      volume: 1.0,
      muted: false,
      soloed: false,
    },
    {
      title: "80s Vibe",
      file: Vibe,
      colour: "#10e8cf",
      buffer: null,
      audioSource: null,
      gainNode: null,
      volume: 1.0,
      muted: false,
      soloed: false,
    },
    {
      title: "Running Out",
      file: Running,
      colour: "#ad1b1b",
      buffer: null,
      audioSource: null,
      gainNode: null,
      volume: 1.0,
      muted: false,
      soloed: false,
    },
  ]);

  useEffect(() => {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ac);

    Promise.all(
      stems.map((stem) =>
        fetch(stem.file)
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            return { ...stem, buffer: buffer, uuid: crypto.randomUUID() };
          })
      )
    ).then((initialisedStems) => {
      updateStemState(initialisedStems);
    });
  }, []);

  function playAudio() {
    const newTracks = stems.map(async (track) => {
      let source = null;
      let gain = null;
      if (true) {
        source = audioContext.createBufferSource();
        gain = audioContext.createGain();
        if (!(track.buffer instanceof AudioBuffer)) {
          track.buffer = await audioContext.decodeAudioData(track.buffer);
        }
        source.buffer = track.buffer;
        source.connect(gain);
        gain.connect(audioContext.destination);
      }
      return { ...track, audioSource: source, gainNode: gain };
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

  function pauseAudio() {
    stems.forEach((stem) => {
      stem.audioSource.stop();
    });

    setIsPlaying(false);
    cancelAnimationFrame(requestRef.current);
  }

  function updateMuteState(trackUUID) {
    const audioSource = stems.find(data => data.uuid === trackUUID);
    if (audioSource) {
      console.log("updating mute state");
      updateStemState(stems.map((data) => data.uuid === trackUUID ? { ...data, muted: !data.muted } : data));
      toggleStemMute(trackUUID, !audioSource.muted);
    } else {
      console.error(`No audio source found with id ${trackUUID}`);
    }
  }

  function updateSoloState(trackUUID) {
    const updatedTracks = [...stems];
    const trackIndex = updatedTracks.findIndex(
      (track) => track.uuid === trackUUID
    );
    if (trackIndex === -1) return;
    updatedTracks[trackIndex].soloed = !updatedTracks[trackIndex].soloed;
    updateStemState(updatedTracks);
    toggleTrackSolo();
  }

  function toggleStemMute(trackUUID, muteState) {
    const stem = stems.find((data) => data.uuid === trackUUID);
    if (!stem) return;
    
    stem.gainNode.gain.value = muteState ? 0 : stem.volume;
  }

  function toggleTrackSolo() {
    if (isSoloActive()) {
      stems.forEach(stem => {
        toggleStemMute(stem.uuid, !stem.soloed)
      });
    } else {
      stems.forEach((stem) => {
        toggleStemMute(stem.uuid, stem.muted)
      });
    }
  }

  function isSoloActive() {
    return stems.some((stem) => stem.soloed);
  }

  function onSeekBarClick(e) {
    // const percentage =
    //   (e.clientX - TRACK_HEADER_WIDTH) / (width - TRACK_HEADER_WIDTH);
    // tracks.forEach((track) => {
    //   track.howl.seek(percentage * track.howl.duration());
    // });
    // updateSeekBar();
  }

  function onPlayPause() {
    isPlaying ? pauseAudio() : playAudio();
  }

  // function play() {
  //   setPlaying(true);
  //   console.log("playing");

  //   tracks.forEach((track) => {
  //     track.howl.play();
  //   });
  //   requestRef.current = requestAnimationFrame(animate);
  // }

  // function pause() {
  //   setPlaying(false);
  //   console.log("paused");

  //   tracks.forEach((track) => {
  //     track.howl.pause();
  //   });
  //   cancelAnimationFrame(requestRef.current);
  // }

  function updateSeekBar() {
    // var masterHowl = tracks[0].howl;
    // if (masterHowl) {
    //   setSeekbarWidth(
    //     (masterHowl.seek() / masterHowl.duration()) *
    //       (width - TRACK_HEADER_WIDTH)
    //   );
    // }
  }

  // Clock/timing
  const clockTick = (time) => {
    const timeChange =
      audioContext.currentTime - timingRef.current.lastTimeStamp;

    timingRef.current = {
      lastTimeStamp: audioContext.currentTime,
      currentTime: timingRef.current.currentTime + timeChange,
    };

    if (previousTimeRef.current != undefined) {
      // updateSeekBar();
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(clockTick);
  };

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
              isSoloActive={isSoloActive()}
              onSeekBarClick={(e) => onSeekBarClick(e)}
              onMuteClick={() => updateMuteState(track.uuid)}
              onSoloClick={() => updateSoloState(track.uuid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
