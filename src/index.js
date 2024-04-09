import { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';

import App from './components/App';
import MultiAudioPlayer from './components/Test';

// import Rave from "/Users/williamchambers/Developer/stemplayer/src/components/audio/Bass.mp3";
// import Vibe from "/Users/williamchambers/Developer/stemplayer/src/components/audio/Solo.mp3";
// import Running from "/Users/williamchambers/Developer/stemplayer/src/components/audio/VP.mp3";

// const audioFiles = [Rave];

const audioFiles = ['/Users/williamchambers/Developer/stemplayer/src/components/audio/TestAudio/VP.mp3'];

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App/>
  </StrictMode>,
);
