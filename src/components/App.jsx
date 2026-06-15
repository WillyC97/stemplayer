import React from "react";
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from "../firebase/firebaseConfig";
import SortableTrack from "./Track";
import { secondsToMinutes } from "../utils/time";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";

const TRACK_HEADER_WIDTH = 330;

//=========================================================================

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      audioContext: null,
      stems: props.songData.StemInfo || [],
      width: document.documentElement.clientWidth,
      mainPanelWidth: 100,
      filePanelVisible: false,
    };

    this.requestRef = null;
    this.timingRef = { lastTimeStamp: 0.0, currentTime: 0.0 };
    this.trackLengthRef = 0.0;
    this.songInfo = props.songData.SongInfo;

    // Web Audio nodes are imperative objects, not render data, so they live
    // in a ref keyed by stem uuid rather than in component state.
    this.audioNodes = new Map();
    // The playhead and time readout are updated imperatively each animation
    // frame (see updateSeekBar) to avoid re-rendering the whole tree at 60fps.
    this.tracksRef = React.createRef();
    this.timeRef = React.createRef();
  }

  //=========================================================================
  // Helpers
  //-----------------------------------------------------------------------

  isSoloActive() {
    return this.state.stems.some((stem) => stem.soloed);
  }
  //-----------------------------------------------------------------------

  findStem(trackUUID) {
    return this.state.stems.find((data) => data.uuid === trackUUID);
  }
  //-----------------------------------------------------------------------

  updateStemParameter(trackUUID, key, value, onUpdated) {
    if (!this.findStem(trackUUID)) {
      console.error(`No audio source found with id ${trackUUID}`);
      return;
    }

    this.setState(
      {
        stems: this.state.stems.map((data) =>
          data.uuid === trackUUID ? { ...data, [key]: value } : data
        ),
      },
      onUpdated
    );
  }

  renderTime() {
    let currentTimeString = "";
    let totalTimeString = "";
    if (this.trackLengthRef > 0) {
      currentTimeString = secondsToMinutes(this.timingRef.currentTime);
      totalTimeString = secondsToMinutes(this.trackLengthRef);
    }

    return currentTimeString + " / " + totalTimeString;
  }

  //=========================================================================
  // Loading
  //-----------------------------------------------------------------------

  componentDidMount() {  
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    this.setState({ audioContext: ac });
  
    const audioFolderPath = this.songInfo.songpath + "Audio/";
    const waveformFolderPath = this.songInfo.songpath + "waveforms/";
  
    Promise.all(
      this.state.stems.map((stem, index) => {
        const audioRef = ref(storage, audioFolderPath + stem.file);
        const imageRef = ref(storage, waveformFolderPath + stem.waveform);
  
        return Promise.all([
          getDownloadURL(audioRef)
            .then((url) => fetch(url))
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => ac.decodeAudioData(arrayBuffer)),
          getDownloadURL(imageRef)
        ]).then(([audioBuffer, imageUrl]) => {
          return {
            ...stem,
            id: index + 1,
            buffer: audioBuffer,
            audioLength: audioBuffer.duration,
            volume: stem.volume ?? 1.0,
            pan: 0.0,
            muted: false,
            soloed: false,
            uuid: crypto.randomUUID(),
            loaded: true,
            waveform: imageUrl
          };
        });
      })
    ).then((initialisedStems) => {
      this.trackLengthRef = Math.max(
        ...initialisedStems.map((stem) => stem.audioLength || 0)
      );
      this.setState({ stems: initialisedStems });
    });
  
    document.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    this.pauseAudio();
    this.jumpToTime(0.0, false);
    document.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
  }

  handleKeyDown = (event) => {
    if (event.code === "Space") {
      this.onPlayPause();
    } else if (event.code === "ArrowRight") {
      const time =
        this.timingRef.currentTime + 5 > this.trackLengthRef
          ? this.trackLengthRef
          : this.timingRef.currentTime + 5;
      this.jumpToTime(time, this.state.isPlaying);
    } else if (event.code === "ArrowLeft") {
      const time =
        this.timingRef.currentTime - 5 < 0 ? 0 : this.timingRef.currentTime - 5;
      this.jumpToTime(time, this.state.isPlaying);
    } else if (event.code === "Enter" || event.code === "Return") {
      this.jumpToTime(0, this.state.isPlaying);
    }
  };

  handleResize = () => {
    this.updateWidth();
  };

  updateWidth() {
    const width =
      document.documentElement.clientWidth * (this.state.mainPanelWidth / 100) -
      TRACK_HEADER_WIDTH;

    this.setState({width: width,}, () => {this.updateSeekBar();} );
  }

  //=========================================================================
  // Play/Pause
  //-----------------------------------------------------------------------

  onPlayPause = () => {
    this.state.isPlaying ? this.pauseAudio() : this.playAudio();
  };
  //-----------------------------------------------------------------------

  playAudio() {
    const ac = this.state.audioContext;

    // Buffer sources are one-shot, so a fresh node graph is built for each
    // playback and stored in this.audioNodes keyed by stem uuid.
    this.state.stems.forEach((stem) => {
      if (!stem.buffer) return;

      const source = ac.createBufferSource();
      const gain = ac.createGain();
      const pan = ac.createStereoPanner();
      source.buffer = stem.buffer;
      source.connect(gain);
      gain.connect(pan);
      pan.connect(ac.destination);

      this.audioNodes.set(stem.uuid, { source, gain, pan });
      this.applyGain(stem.uuid);
      this.applyPan(stem.uuid);
      source.start(0.02, this.timingRef.currentTime);
    });

    this.setState({ isPlaying: true });
    this.timingRef.lastTimeStamp = ac.currentTime;
    this.requestRef = requestAnimationFrame(this.clockTick);
  }
  //-----------------------------------------------------------------------

  pauseAudio() {
    this.audioNodes.forEach(({ source }) => {
      try {
        source.stop();
      } catch (e) {
        // already stopped / never started — safe to ignore
      }
    });
    this.audioNodes.clear();

    cancelAnimationFrame(this.requestRef);
    this.setState({ isPlaying: false });
  }

  //=========================================================================
  // Mute/Solo
  //-----------------------------------------------------------------------

  toggleStemMute = (trackUUID) => {
    const stem = this.findStem(trackUUID);
    if (!stem) return;

    // Solo state is unaffected, so only this track's gain needs reapplying.
    this.updateStemParameter(trackUUID, "muted", !stem.muted, () =>
      this.applyGain(trackUUID)
    );
  };
  //-----------------------------------------------------------------------

  toggleStemSolo = (trackUUID) => {
    const stem = this.findStem(trackUUID);
    if (!stem) return;

    // Soloing changes which tracks are audible, so every gain is reapplied.
    this.updateStemParameter(trackUUID, "soloed", !stem.soloed, () =>
      this.applyAllGains()
    );
  };
  //-----------------------------------------------------------------------

  applyGain(stemUUID) {
    const nodes = this.audioNodes.get(stemUUID);
    const stem = this.findStem(stemUUID);
    if (!nodes || !stem) return;

    nodes.gain.gain.value =
      stem.muted || (!stem.soloed && this.isSoloActive()) ? 0 : stem.volume;
  }

  applyAllGains() {
    this.state.stems.forEach((stem) => this.applyGain(stem.uuid));
  }

  applyPan(stemUUID) {
    const nodes = this.audioNodes.get(stemUUID);
    const stem = this.findStem(stemUUID);
    if (!nodes || !stem) return;

    nodes.pan.pan.setValueAtTime(stem.pan, this.state.audioContext.currentTime);
  }

  setStemVolume = (element, stemUUID) => {
    this.updateStemParameter(stemUUID, "volume", element.target.value, () =>
      this.applyGain(stemUUID)
    );
  };

  setStemPan = (pan, stemUUID) => {
    this.updateStemParameter(stemUUID, "pan", pan, () => this.applyPan(stemUUID));
  };

  //=========================================================================
  // Seekbar
  //-----------------------------------------------------------------------

  onSeekBarClick = (e) => {
    const percentage = (e.clientX - TRACK_HEADER_WIDTH) / this.state.width;
    this.jumpToTime(percentage * this.trackLengthRef, this.state.isPlaying);
  };
  //-----------------------------------------------------------------------

  // Updates the playhead and time readout imperatively. Every track's seek
  // bar reads the --seek-bar-width CSS variable, so one DOM write moves them
  // all without a React render — important since this runs ~60fps while playing.
  updateSeekBar() {
    const ratio =
      this.trackLengthRef > 0
        ? this.timingRef.currentTime / this.trackLengthRef
        : 0;

    if (this.tracksRef.current) {
      this.tracksRef.current.style.setProperty(
        "--seek-bar-width",
        `${ratio * this.state.width}px`
      );
    }

    if (this.timeRef.current) {
      this.timeRef.current.textContent = this.renderTime();
    }
  }

  //=========================================================================
  // Clock/timing
  //-----------------------------------------------------------------------

  clockTick = () => {
    const timeChange =
      this.state.audioContext.currentTime - this.timingRef.lastTimeStamp;

    this.timingRef = {
      lastTimeStamp: this.state.audioContext.currentTime,
      currentTime: this.timingRef.currentTime + timeChange,
    };

    if (this.timingRef.currentTime >= this.trackLengthRef) {
      this.pauseAudio();
      this.jumpToTime(0.0, false);
      return;
    }

    this.updateSeekBar();
    this.requestRef = requestAnimationFrame(this.clockTick);
  };

  jumpToTime(time, wasPlaying) {
    if (wasPlaying) this.pauseAudio();
    this.timingRef.currentTime = time;
    this.updateSeekBar();
    if (wasPlaying) this.playAudio();
  }

  handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const activeIndex = this.state.stems.findIndex(
        (stem) => stem.id === active.id
      );
      const overIndex = this.state.stems.findIndex(
        (stem) => stem.id === over.id
      );
      const newStems = [...this.state.stems];
      newStems.splice(overIndex, 0, newStems.splice(activeIndex, 1)[0]);
      this.setState({ stems: newStems });
    }
  };

  //=========================================================================
  //  Render
  //-----------------------------------------------------------------------

  render() {
    return (
      <div>
        <div className="page-header">
          <div className="btn">
            {this.state.isPlaying ? (
              <div
                className="button pause-button"
                onClick={() => this.onPlayPause()}
              >
                <i className="fas fa-pause"></i>
              </div>
            ) : (
              <div
                className="button play-button"
                onClick={() => this.onPlayPause()}
              >
                <i className="fas fa-play"></i>
              </div>
            )}
          </div>
          <div className="time" ref={this.timeRef}>{this.renderTime()}</div>
          <div className="song-title">{this.songInfo.songtitle}</div>
          {this.songInfo.pdf && (
          <div className="btn">
          <div
            className="button doc-button"
            onClick={() => {this.setState({
                filePanelVisible: !this.state.filePanelVisible,
              });
            }}
          >
            <i className="fas fa-file"></i>
          </div>
          </div>)}
        </div>
        <PanelGroup direction="horizontal">
          <Panel
            id="main"
            minSize={25}
            order={1}
            onResize={(size) => {
              this.setState({ mainPanelWidth: size }, () => {this.updateWidth()});
            }}
          >
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              collisionDetection={closestCenter}
              onDragEnd={this.handleDragEnd}
            >
              <SortableContext
                items={this.state.stems}
                strategy={verticalListSortingStrategy}
              >
                <div ref={this.tracksRef}>
                  {this.state.stems.map((track) => (
                    <SortableTrack
                      key={track.uuid}
                      track={track}
                      trackWidth={this.state.width}
                      isSoloActive={this.isSoloActive()}
                      onSeekBarClick={(e) => this.onSeekBarClick(e)}
                      onMuteClick={() => this.toggleStemMute(track.uuid)}
                      onSoloClick={() => this.toggleStemSolo(track.uuid)}
                      onSliderInput={(e) => this.setStemVolume(e, track.uuid)}
                      onPanSliderInput={(newValue) =>
                        this.setStemPan(newValue, track.uuid)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </Panel>
          {this.state.filePanelVisible && (
            <>
              <PanelResizeHandle className="panel-resize-handle"/>
              <Panel id="sidebar" minSize={25} order={2}>
              <iframe src={this.songInfo.pdf} width="100%" height="800px" allow="autoplay"></iframe>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    );
  }
}

export default App;
