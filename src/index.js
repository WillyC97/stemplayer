import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import App from './components/App';
import HomeComponent from './components/HomeComponent';

import walkinOnSunshineData from './pages/walkinOnSunshine.json';
import exileData from './pages/exile.json';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function MainPage() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/walkinOnSunshine" element={<App songData={walkinOnSunshineData} />} />
          <Route path="/exile" element={<App songData={exileData} />} />
        </Routes>
    </BrowserRouter>
  );
}

root.render(
  <StrictMode>
    <MainPage />
  </StrictMode>,
);
