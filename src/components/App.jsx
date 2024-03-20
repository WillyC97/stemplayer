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
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const { height, width } = useWindowDimensions();

  const [seekBarWidth, setSeekbarWidth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tracks, setSound] = useState([
    {
      title: "Rave Digger",
      file: Rave,
      colour: "#ad1b1b",
      howl: null,
    },
    {
      title: "80s Vibe",
      file: Vibe,
      colour: "#10e8cf",
      howl: null,
    },
    {
      title: "Running Out",
      file: Running,
      colour: "#ad1b1b",
      howl: null,
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
      };
    });

    setSound(updatedTracks);
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
              title={track.title}
              trackWidth={width - TRACK_HEADER_WIDTH}
              backgroundColour={track.colour}
              onSeekBarClick={(e) => onSeekBarClick(e)}
              seekBarWidth={seekBarWidth + "px"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
