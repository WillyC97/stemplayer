import React from "react";
import Track from "./Track";
import { useState } from "react";

function App() {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <div className="black-bar d-flex flex-row">
        <div className="btn">
          {playing ? (
            <div id="pause-button" onClick={() => setPlaying(false)} />
          ) : (
            <div id="play-button" onClick={() => setPlaying(true)} />
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
