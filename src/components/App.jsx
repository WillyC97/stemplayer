import React from "react";
import Track from "./Track";
import { useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import useWindowDimensions from "../utils/WindowDimensions";

import Rave from "/Users/williamchambers/Developer/stemplayer/src/components/audio/Bass.mp3";
import Vibe from "/Users/williamchambers/Developer/stemplayer/src/components/audio/Solo.mp3";
import Running from "/Users/williamchambers/Developer/stemplayer/src/components/audio/VP.mp3";

const TRACK_HEADER_WIDTH = 200;

function App() {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const { height, width } = useWindowDimensions();

  const [seekBarWidth, setSeekbarWidth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tracks, updateTrackState] = useState([
    {
      title: "Rave Digger",
      file: Rave,
      colour: "#ad1b1b",
      howl: null,
      muted: false,
    },
    {
      title: "80s Vibe",
      file: Vibe,
      colour: "#10e8cf",
      howl: null,
      muted: false,
    },
    {
      title: "Running Out",
      file: Running,
      colour: "#ad1b1b",
      howl: null,
      muted: false,
    },
  ]);

  useEffect(() => {
    initialiseStems();
    console.log("Initialise stems");
  }, []);

  function initialiseStems() {
    const updatedTracks = tracks.map((track) => {
      return {
        ...track,
        howl: new Howl({
          src: [track.file],
          html5: true,
        }),
        uuid: crypto.randomUUID(),
        soloed: false,
      };
    });

    updateTrackState(updatedTracks);
  }

  function updateMuteState(trackUUID) {
    const updatedTracks = [...tracks];

    const trackIndex = updatedTracks.findIndex(
      (track) => track.uuid === trackUUID
    );

    if (trackIndex === -1) return;

    updatedTracks[trackIndex].muted = !updatedTracks[trackIndex].muted;

    updateTrackState(updatedTracks);

    toggleTrackMute(trackIndex);
  }

  function updateSoloState(trackUUID) {
    const updatedTracks = [...tracks];

    const trackIndex = updatedTracks.findIndex(
      (track) => track.uuid === trackUUID
    );

    if (trackIndex === -1) return;

    updatedTracks[trackIndex].soloed = !updatedTracks[trackIndex].soloed;

    updateTrackState(updatedTracks);

    toggleTrackSolo();
  }

  function toggleTrackMute(trackIndex) {
    const trackToMute = tracks[trackIndex];
    trackToMute.howl.mute(trackToMute.muted);
  }

  function toggleTrackSolo() {

    if (isSoloActive()) {
      tracks.forEach(track => {
        track.howl.mute(!track.soloed);
      });
    } else {
      tracks.forEach((track) => {
        track.howl.mute(track.muted);
      });
    }
  }

  function isSoloActive() {
    return tracks.some((track) => track.soloed);
  }

  function onSeekBarClick(e) {
    const percentage =
      (e.clientX - TRACK_HEADER_WIDTH) / (width - TRACK_HEADER_WIDTH);

    tracks.forEach((track) => {
      track.howl.seek(percentage * track.howl.duration());
    });

    updateSeekBar();
  }

  function onPlayPause() {
    playing ? pause() : play();
  }

  function play() {
    setPlaying(true);
    console.log("playing");

    tracks.forEach((track) => {
      track.howl.play();
    });
    requestRef.current = requestAnimationFrame(animate);
  }

  function pause() {
    setPlaying(false);
    console.log("paused");

    tracks.forEach((track) => {
      track.howl.pause();
    });
    cancelAnimationFrame(requestRef.current);
  }

  function updateSeekBar() {
    var masterHowl = tracks[0].howl;
    if (masterHowl) {
      setSeekbarWidth(
        (masterHowl.seek() / masterHowl.duration()) *
          (width - TRACK_HEADER_WIDTH)
      );
    }
  }

  const animate = (time) => {
    if (previousTimeRef.current != undefined) {
      updateSeekBar();
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div>
      <div className="black-bar d-flex flex-row">
        <div className="btn">
          {playing ? (
            <div id="pause-button" onClick={() => onPlayPause()} />
          ) : (
            <div id="play-button" onClick={() => onPlayPause()} />
          )}
        </div>
      </div>
      <div className="d-flex flex-row">
        <div className="flex-grow-1 flex-shrink-0">
          {tracks.map((track) => (
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
