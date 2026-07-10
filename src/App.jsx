// App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ensureAnonymousAuth } from './services/firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Home from './components/Home';
import Room from './components/Room';

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { ensureAnonymousAuth().then(() => setReady(true)); }, []);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-grey text-3xl font-bold mb-8 tracking-tight text-center text-white">
        Connecting...
      </div>
    );
  }

  return (
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}