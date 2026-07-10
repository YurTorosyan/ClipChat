import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import RoomList from './RoomList';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faSun,
  faMoon,
  faPlus,
  faSignInAlt,
  faClipboard, // иконка для лого
} from '@fortawesome/free-solid-svg-icons';

const generateRoomId = () => Math.random().toString(36).substring(2, 8);
const STORAGE_KEY = 'clipboard_rooms';

const loadRooms = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};
const saveRooms = (rooms) => localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));

export default function Home() {
  const [roomName, setRoomName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState(loadRooms);
  const navigate = useNavigate();
  const { t, lang, changeLanguage } = useLanguage();
  const { dark, toggleTheme } = useTheme();

  const addRoomToList = (id, name) => {
    setRooms(prev => {
      const exists = prev.find(r => r.id === id);
      if (exists) return prev;
      const updated = [{ id, name }, ...prev].slice(0, 20);
      saveRooms(updated);
      return updated;
    });
  };

  const deleteRoom = (id) => {
    setRooms(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveRooms(updated);
      return updated;
    });
  };

  const createRoom = async () => {
    const id = generateRoomId();
    const name = roomName.trim() || (lang === 'ru' ? 'Без названия' : 'Untitled');
    try {
      await setDoc(doc(db, 'rooms', id), {
        name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      addRoomToList(id, name);
      navigate(`/room/${id}?name=${encodeURIComponent(name)}`);
    } catch (e) {
      setError('Ошибка создания комнаты');
    }
  };

  const joinRoom = async (idParam) => {
    const id = (idParam || joinId).trim().toLowerCase();
    if (!id) return;
    const snap = await getDoc(doc(db, 'rooms', id));
    if (snap.exists()) {
      const name = snap.data().name || 'Комната';
      addRoomToList(id, name);
      navigate(`/room/${id}`);
    } else {
      setError(t('roomNotFound'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white p-4 transition-colors">
      {/* Панель управления (язык/тема) */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => changeLanguage(lang === 'ru' ? 'en' : 'ru')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95"
            title={t('language')}
          >
            <FontAwesomeIcon icon={faGlobe} className="text-xl text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95"
            title={dark ? t('light') : t('dark')}
          >
            <FontAwesomeIcon icon={dark ? faSun : faMoon} className="text-xl text-yellow-500" />
          </button>
        </div>
      </div>

      {/* Логотип */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
          <FontAwesomeIcon icon={faClipboard} className="text-4xl text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8 tracking-tight">{t('appTitle')}</h1>
      <div className="w-full max-w-md">
        <RoomList rooms={rooms} onEnter={joinRoom} onDelete={deleteRoom} />

        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl mb-3 font-semibold">{t('createGroup')}</h2>
            <div className="flex gap-2">
              <input
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder={t('groupNamePlaceholder')}
                className="flex-1 p-3 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={createRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                title={t('createButton')}
              >
                <FontAwesomeIcon icon={faPlus} className="text-xl" />
              </button>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-xl mb-3 font-semibold">{t('joinGroup')}</h2>
            <div className="flex gap-2">
              <input
                value={joinId}
                onChange={e => setJoinId(e.target.value)}
                placeholder={t('roomIdPlaceholder')}
                className="flex-1 p-3 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button
                onClick={() => joinRoom()}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                title={t('joinButton')}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="text-xl" />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}