import React, { useState, useEffect } from 'react';

const MultiAudioPlayer = ({ audioFiles }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [sources, setSources] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [panValues, setPanValues] = useState([]);

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    return () => {
      if (context) {
        context.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioContext) {
      loadAndPlay();
    }
  }, [audioContext]); // Load and play audio files when audioContext is ready

  const loadAudioFile = (url) => {
    return fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
  };
  
  const loadAndPlay = () => {
    Promise.all(audioFiles.map(loadAudioFile))
      .then(buffers => {
        const audioSources = buffers.map(buffer => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          return source;
        });
  
        setSources(audioSources);
        setPanValues(new Array(audioSources.length).fill(0));
      });
  };



  const togglePlayback = () => {
    if (isPlaying) {
      sources.forEach(source => source.stop());
    } else {
      const startTime = audioContext.currentTime;
      sources.forEach((source, index) => {
        source.connect(audioContext.destination);
        source.pan.value = panValues[index]; // Set initial pan value
        source.start(startTime);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handlePanChange = (index, event) => {
    const newPanValues = [...panValues];
    newPanValues[index] = parseFloat(event.target.value);
    setPanValues(newPanValues);

    if (sources[index]) {
      sources[index].pan.value = newPanValues[index];
    }
  };

  return (
    <div>
      <button onClick={togglePlayback}>{isPlaying ? 'Pause' : 'Play'}</button>
      {audioFiles.map((file, index) => (
        <div key={index}>
          <button onClick={() => sources[index]?.stop()}>
            Stop Audio {index + 1}
          </button>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={panValues[index]}
            onChange={event => handlePanChange(index, event)}
          />
        </div>
      ))}
    </div>
  );
};

export default MultiAudioPlayer;
