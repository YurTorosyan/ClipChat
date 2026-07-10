import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ensureAnonymousAuth } from './services/firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './components/Home';
import Room from './components/Room';

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { ensureAnonymousAuth().then(() => setReady(true)); }, []);
  if (!ready) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Подключение...</div>;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}