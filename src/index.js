import { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';

import App from './components/App';
import songData from './pages/walkinOnSunshine.json';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App songData={songData} />
  </StrictMode>,
);
