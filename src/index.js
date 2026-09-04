import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./contexts/authContext";
import AuthWrapper from './components/AuthWrapper';
import App from './components/App';
import SignInComp from './components/SignInComp';
import Register from './components/Register';
import HomeComponent from './components/HomeComponent';
import ArtistPage from './pages/ArtistPage';
import UnlockGuard from './components/UnlockGuard';
import { catalog, songRoutes } from './catalog';

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

        {catalog.map((artist) => (
          <Route
            key={artist.key}
            path={`/${artist.key}`}
            element={
              <AuthWrapper>
                <UnlockGuard artistKey={artist.key}>
                  <ArtistPage artist={artist} />
                </UnlockGuard>
              </AuthWrapper>
            }
          />
        ))}

        {songRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AuthWrapper>
                <UnlockGuard artistKey={route.artistKey}>
                  <App key={route.path} songId={route.id} songData={route.data} />
                </UnlockGuard>
              </AuthWrapper>
            }
          />
        ))}
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
