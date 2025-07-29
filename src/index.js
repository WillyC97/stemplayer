import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import { AuthProvider } from "./contexts/authContext";
import AuthWrapper from './components/AuthWrapper';
import App from './components/App';
import SignInComp from './components/SignInComp';
import Register from './components/Register';
import HomeComponent from './components/HomeComponent';

// ChoirCo
import ChoirCoPage from './pages/ChoirCo/ChoirCo';
import walkinOnSunshineData from './pages/ChoirCo/walkinOnSunshine.json';
import exileData from './pages/ChoirCo/exile.json';

// TurdStory
import TurdStoryPage from './pages/TurdStory/TurdStory';
import oneLastTimeData from './pages/TurdStory/oneLastTime.json';

// Dovengers
import DovengersPage from './pages/Dovengers/Dovengers';
import kissFromARoseData from './pages/Dovengers/kissFromARose.json';
import rockWithYouData from './pages/Dovengers/rockWithYou.json';
import rosannaData from './pages/Dovengers/rosanna.json';
import myLifeData from './pages/Dovengers/myLife.json';
import smackDownData from './pages/Dovengers/smackDown.json';
import smileOnYourFaceData from './pages/Dovengers/smileOnYourFace.json';
import pegData from './pages/Dovengers/peg.json'
import girlIsMineData from './pages/Dovengers/girlIsMine.json'
import holdTheLineData from './pages/Dovengers/holdTheLine.json'

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function MainPage() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
        <Route path="*" element={<SignInComp />} />
          <Route path="/login" element={<SignInComp />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<AuthWrapper><HomeComponent /></AuthWrapper>} />
{/* ----------------------ChoirCo----------------------- */}
          <Route path="/ChoirCo" element={<ChoirCoPage />} />
          <Route path="/ChoirCo/walkinOnSunshine" element={<App songData={walkinOnSunshineData} />} />
          <Route path="/ChoirCo/exile" element={<App songData={exileData} />} />
{/* ----------------------TurdStory----------------------- */}
          <Route path="/TurdStory" element={<TurdStoryPage />} />
          <Route path="/TurdStory/oneLastTime" element={<App songData={oneLastTimeData} />} />
{/* ----------------------Dovengers----------------------- */}
          <Route path="/Dovengers" element={<DovengersPage />} />
          <Route path="/Dovengers/kissFromARose" element={<App songData={kissFromARoseData} />} />
          <Route path="/Dovengers/rockWithYou" element={<App songData={rockWithYouData} />} />
          <Route path="/Dovengers/rosanna" element={<App songData={rosannaData} />} />
          <Route path="/Dovengers/myLife" element={<App songData={myLifeData} />} />
          <Route path="/Dovengers/smackDown" element={<App songData={smackDownData} />} />
          <Route path="/Dovengers/smileOnYourFace" element={<App songData={smileOnYourFaceData} />} />
          <Route path="/Dovengers/peg" element={<App songData={pegData} />} />
          <Route path="/Dovengers/girlIsMine" element={<App songData={girlIsMineData} />} />
          <Route path="/Dovengers/holdTheLine" element={<App songData={holdTheLineData} />} />
        </Routes>
    </BrowserRouter>
  );
}

root.render(
  <StrictMode>
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  </StrictMode>,
);
