import React from "react";
import Track from "./Track";
import { useState } from "react";
import { Howl, Howler } from "howler";

function App() {
  const [playing, setPlaying] = useState(false);

  const tracks = [
    {
      title: "Rave Digger",
      file: "rave_digger",
      howl: null,
    },
    {
      title: "80s Vibe",
      file: "80s_vibe",
      howl: null,
    },
    {
      title: "Running Out",
      file: "running_out",
      howl: null,
    },
  ];

  function initialiseStems() {
    tracks.forEach((track) => {
      track.howl = new Howl({
        src: [track.file],
        html5: true,
      });
    });
  }

  function onPlayPause() {
    if (playing) {
      pause();
    } else {
      play();
    }
  }

  function play() {
    setPlaying(true);
    console.log("playing");
  }

  function pause() {
    setPlaying(false);
    console.log("paused");
  }

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
          <Track title="Track1" trackWidth="180px" backgroundColour="#ad1b1b" />
          <Track title="Track2" trackWidth="180px" backgroundColour="#10e8cf" />
        </div>
      </div>
    </div>
  );
}

export default App;
