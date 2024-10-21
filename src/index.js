import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import App from './components/App';
import HomeComponent from './components/HomeComponent';

// ChoirCo
import ChoirCoPage from './pages/ChoirCo/ChoirCo';
import walkinOnSunshineData from './pages/ChoirCo/walkinOnSunshine.json';
import exileData from './pages/ChoirCo/exile.json';

// TurdStory
import TurdStoryPage from './pages/TurdStory/TurdStory';
import oneLastTimeData from './pages/TurdStory/oneLastTime.json';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function MainPage() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/ChoirCo" element={<ChoirCoPage />} />
          <Route path="/ChoirCo/walkinOnSunshine" element={<App songData={walkinOnSunshineData} />} />
          <Route path="/ChoirCo/exile" element={<App songData={exileData} />} />
          <Route path="/TurdStory" element={<TurdStoryPage />} />
          <Route path="/TurdStory/oneLastTime" element={<App songData={oneLastTimeData} />} />
        </Routes>
    </BrowserRouter>
  );
}

root.render(
  <StrictMode>
    <MainPage />
  </StrictMode>,
);
