// Seconds to Minutes
export function secondsToMinutes(seconds) {
    if (!seconds) { return '0:00'; }
    const roundedSeconds = Math.round(seconds);
    const mins = Math.floor(roundedSeconds / 60);
    let secs = roundedSeconds % 60;
    if (secs < 10) { secs = "0" + secs; }
    return mins + ":" + secs;
  }