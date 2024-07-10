import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import App from './components/App';
import songData from './pages/walkinOnSunshine.json';
import HomeComponent from './components/HomeComponent';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function MainPage() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/walkinOnSunshine" element={<App songData={songData} />} />
        </Routes>
    </BrowserRouter>
  );
}

root.render(
  <StrictMode>
    <MainPage />
  </StrictMode>,
);
