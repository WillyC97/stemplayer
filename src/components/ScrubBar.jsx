import React, { useRef, useCallback } from "react";

function ScrubBar({ scrubBarRef, trackLength, onSeek }) {
  const isDragging = useRef(false);

  const seekFromEvent = useCallback(
    (e) => {
      if (!scrubBarRef.current || trackLength <= 0) return;
      const rect = scrubBarRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(pct * trackLength);
    },
    [scrubBarRef, trackLength, onSeek]
  );

  const handlePointerDown = useCallback(
    (e) => {
      isDragging.current = true;
      e.target.setPointerCapture(e.pointerId);
      seekFromEvent(e);
    },
    [seekFromEvent]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (isDragging.current) seekFromEvent(e);
    },
    [seekFromEvent]
  );

  const handlePointerUp = useCallback((e) => {
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div className="scrub-bar-container" ref={scrubBarRef}>
      <div className="scrub-bar-track">
        <div className="scrub-bar-fill" />
        <div className="scrub-bar-thumb" />
      </div>
      <div
        className="scrub-bar-touch-target"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}

export default ScrubBar;
