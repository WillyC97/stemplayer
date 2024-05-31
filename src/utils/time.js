// Seconds to Minutes
export function secondsToMinutes(seconds) {
    if (!seconds) { return '0:00'; }
    var rounded_seconds = Math.round(seconds);
    var mins = Math.floor(rounded_seconds / 60.0);
    var secs = rounded_seconds % 60;
    if (secs < 10) { secs = "0" + secs; }
    return mins + ":" + secs;
  }