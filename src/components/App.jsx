import React from "react";
import Track from "./Track";
import { secondsToMinutes } from "../utils/time";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

// import Rave from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Bass.mp3";
// import Vibe from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/Solo.mp3";
// import Running from "/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/VP.mp3";

const TRACK_HEADER_WIDTH = 300;

//=========================================================================

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      audioContext: null,
      seekBarWidth: 0,
      stems: window.songInfo || [],
      height: 0,
      clientWidth: document.documentElement.clientWidth,
    };

    this.requestRef = null;
    this.previousTimeRef = 0.0;
    this.timingRef = { lastTimeStamp: 0.0, currentTime: 0.0 };
    this.trackLengthRef = 0.0;
  }

  //=========================================================================
  // Helpers
  //-----------------------------------------------------------------------

  // SortableTrack({
  //   track,
  //   isSoloActive,
  //   onSeekBarClick,
  //   onMuteClick,
  //   onSoloClick,
  //   onSliderInput,
  //   onPanSliderInput,
  // }) {
  //   const {
  //     attributes,
  //     listeners,
  //     setNodeRef,
  //     setActivatorNodeRef,
  //     transform,
  //     transition,
  //   } = useSortable({ id: track.id });
  //   const style = { transition, transform: CSS.Transform.toString(transform) };
  //   return (
  //     <div ref={setNodeRef} style={style}>
  //       <Track
  //         title={track.title}
  //         trackWidth={width - TRACK_HEADER_WIDTH}
  //         backgroundColour={track.colour}
  //         seekBarWidth={seekBarWidth + "px"}
  //         muteState={track.muted}
  //         soloState={track.soloed}
  //         volume={track.volume}
  //         pan={track.pan}
  //         isSoloActive={isSoloActive}
  //         onSeekBarClick={onSeekBarClick}
  //         onMuteClick={onMuteClick}
  //         onSoloClick={onSoloClick}
  //         onSliderInput={onSliderInput}
  //         onPanSliderInput={onPanSliderInput}
  //         activatorRef={setActivatorNodeRef}
  //         attributes={attributes}
  //         listeners={listeners}
  //       />
  //     </div>
  //   );
  // }

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
    }
  };

  onResize(e) {
    this.setState({ clientWidth: document.documentElement.clientWidth });
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
      stem.audioSource.stop();
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
    const percentage =
      (e.clientX - TRACK_HEADER_WIDTH) /
      (this.state.clientWidth - TRACK_HEADER_WIDTH);
    this.jumpToTime(percentage * this.trackLengthRef, this.state.isPlaying);
  };
  //-----------------------------------------------------------------------

  updateSeekBar() {
    const newWidth =
      (this.timingRef.currentTime / this.trackLengthRef) *
      (this.state.clientWidth - TRACK_HEADER_WIDTH);

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
              <div class="pause-button" onClick={() => this.onPlayPause()}>
                <i class="fas fa-pause"></i>
              </div>
            ) : (
              <div class="play-button" onClick={() => this.onPlayPause()}>
                <i class="fas fa-play"></i>
              </div>
            )}
          </div>
          <div className="time">{this.renderTime()}</div>
          <div className="song-title">{"Song"}</div>
        </div>
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
              <Track
                track={track}
                title={track.title}
                trackWidth={this.state.clientWidth - TRACK_HEADER_WIDTH}
                backgroundColour={track.colour}
                seekBarWidth={this.state.seekBarWidth + "px"}
                muteState={track.muted}
                soloState={track.soloed}
                volume={track.volume}
                pan={track.pan}
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
              // <SortableTrack
              //   key={track.uuid}
              //   track={track}
              //   isSoloActive={isSoloActive()}
              //   onSeekBarClick={(e) => onSeekBarClick(e)}
              //   onMuteClick={() => toggleStemMute(track.uuid)}
              //   onSoloClick={() => toggleStemSolo(track.uuid)}
              //   onSliderInput={(e) =>
              //     setStemVolume(e, track.gainNode, track.uuid)
              //   }
              //   onPanSliderInput={(newValue) =>
              //     setStemPan(newValue, track.panNode, track.uuid)
              //   }
              // />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    );
  }
}

export default App;
