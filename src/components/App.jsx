import React from "react";
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
      seekBarWidth: 0,
      stems: window.stemInfo || [],
      height: 0,
      width: document.documentElement.clientWidth,
      mainPanelWidth: 100,
      filePanelVisible: false,
      loaded: false,
    };

    this.requestRef = null;
    this.previousTimeRef = 0.0;
    this.timingRef = { lastTimeStamp: 0.0, currentTime: 0.0 };
    this.trackLengthRef = 0.0;
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

  updateStemParameter(trackUUID, key, value) {
    const stem = this.findStem(trackUUID);
    if (!stem) {
      console.error(`No audio source found with id ${trackUUID}`);
      return;
    }

    stem[key] = value;
    this.setState({
      stems: this.state.stems.map((data) =>
        data.uuid === trackUUID ? { ...data, [key]: value } : data
      ),
    });
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

    Promise.all(
      this.state.stems.map((stem, index) =>
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
              loaded: true,
            };
          })
      )
    ).then((initialisedStems) => {
      this.trackLengthRef = Math.max(
        ...initialisedStems.map((stem) => stem.audioLength || 0)
      );
      this.setState({ stems: initialisedStems });
    });

    document.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", (e) => this.onResize(e));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", (e) => this.onResize(e));
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

  onResize(e) {
    this.updateWidth();
  }

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
    const newTracks = this.state.stems.map(async (stem) => {
      let source = null;
      let gain = null;
      let pan = null;
      if (stem.buffer) {
        source = this.state.audioContext.createBufferSource();
        gain = this.state.audioContext.createGain();
        pan = this.state.audioContext.createStereoPanner();
        this.setStemGainNodeState(stem.uuid, gain);
        this.setStemPanNodeState(stem.uuid, pan);
        source.buffer = stem.buffer;
        source.connect(gain);
        gain.connect(pan);
        pan.connect(this.state.audioContext.destination);
      }
      return { ...stem, audioSource: source, gainNode: gain, panNode: pan };
    });

    Promise.all(newTracks).then((updatedStems) => {
      this.setState({ stems: updatedStems });
      updatedStems.forEach((stem) => {
        if (stem.audioSource)
          stem.audioSource.start(0.02, this.timingRef.currentTime);
      });
      this.setState({ isPlaying: true });
      this.timingRef.lastTimeStamp = this.state.audioContext.currentTime;
      this.requestRef = requestAnimationFrame(this.clockTick);
    });
  }
  //-----------------------------------------------------------------------

  pauseAudio() {
    this.state.stems.forEach((stem) => {
      if (stem.audioSource) stem.audioSource.stop();
    });

    cancelAnimationFrame(this.requestRef);
    this.setState({ isPlaying: false });
  }

  //=========================================================================
  // Mute/Solo
  //-----------------------------------------------------------------------

  toggleStemMute = (trackUUID) => {
    const stem = this.findStem(trackUUID);
    if (!stem) return;

    this.updateStemParameter(stem.uuid, "muted", !stem.muted);
    this.setStemGainNodeState(stem.uuid, stem.gainNode);
  };
  //-----------------------------------------------------------------------

  toggleStemSolo = (trackUUID) => {
    const stem = this.findStem(trackUUID);
    if (!stem) return;

    this.updateStemParameter(trackUUID, "soloed", !stem.soloed);

    this.state.stems.forEach((stem) => {
      this.setStemGainNodeState(stem.uuid, stem.gainNode);
    });
  };
  //-----------------------------------------------------------------------

  setStemGainNodeState(stemUUID, gainNode) {
    const stem = this.findStem(stemUUID);
    if (!stem || !gainNode) return;

    gainNode.gain.value =
      stem.muted || (!stem.soloed && this.isSoloActive()) ? 0 : stem.volume;
  }

  setStemPanNodeState(stemUUID, panNode) {
    const stem = this.findStem(stemUUID);
    if (!stem || !panNode) return;

    panNode.pan.setValueAtTime(stem.pan, this.state.audioContext.currentTime);
  }

  setStemVolume = (element, gainNode, stemUUID) => {
    const volume = element.target.value;
    console.log("fling");

    this.updateStemParameter(stemUUID, "volume", volume);
    this.setStemGainNodeState(stemUUID, gainNode);
  };

  setStemPan = (pan, panNode, stemUUID) => {
    this.updateStemParameter(stemUUID, "pan", pan);
    this.setStemPanNodeState(stemUUID, panNode);
  };

  //=========================================================================
  // Seekbar
  //-----------------------------------------------------------------------

  onSeekBarClick = (e) => {
    const percentage = (e.clientX - TRACK_HEADER_WIDTH) / this.state.width;
    this.jumpToTime(percentage * this.trackLengthRef, this.state.isPlaying);
  };
  //-----------------------------------------------------------------------

  updateSeekBar() {
    const newWidth =
      (this.timingRef.currentTime / this.trackLengthRef) * this.state.width;

    this.setState({ seekBarWidth: newWidth });
  }

  //=========================================================================
  // Clock/timing
  //-----------------------------------------------------------------------

  clockTick = (time) => {
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

    if (this.previousTimeRef != undefined) {
      this.updateSeekBar();
    }

    this.previousTimeRef = time;
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
          <div className="time">{this.renderTime()}</div>
          <div className="song-title">{window.songInfo.songtitle}</div>
          <div
            className="button doc-button"
            onClick={() => {this.setState({
                filePanelVisible: !this.state.filePanelVisible,
              });
            }}
          >
            <i className="fas fa-file"></i>
          </div>
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
                {this.state.stems.map((track) => (
                  <SortableTrack
                    key={track.uuid}
                    track={track}
                    trackWidth={this.state.width}
                    seekBarWidth={this.state.seekBarWidth + "px"}
                    isSoloActive={this.isSoloActive()}
                    onSeekBarClick={(e) => this.onSeekBarClick(e)}
                    onMuteClick={() => this.toggleStemMute(track.uuid)}
                    onSoloClick={() => this.toggleStemSolo(track.uuid)}
                    onSliderInput={(e) =>
                      this.setStemVolume(e, track.gainNode, track.uuid)
                    }
                    onPanSliderInput={(newValue) =>
                      this.setStemPan(newValue, track.panNode, track.uuid)
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Panel>
          {this.state.filePanelVisible && (
            <>
              <PanelResizeHandle className="panel-resize-handle"/>
              <Panel id="sidebar" minSize={25} order={2}>
              <iframe src="https://drive.google.com/file/d/1sBo_Zxk58Cc8pSMnDVPWcPSvVDpZt-iG/preview" width="100%" height="800px" allow="autoplay"></iframe>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    );
  }
}

export default App;
