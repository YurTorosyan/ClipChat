import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import RoomList from './RoomList';

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
    const name = roomName.trim() || 'Без названия';
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
      setError('Комната не найдена');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">📋 Буфер обмена P2P</h1>
      <div className="w-full max-w-md">
        <RoomList rooms={rooms} onEnter={joinRoom} onDelete={deleteRoom} />
        
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-xl mb-3">Создать группу</h2>
            <input value={roomName} onChange={e => setRoomName(e.target.value)}
              placeholder="Имя группы" className="w-full p-3 rounded-lg bg-gray-700 mb-3 outline-none" />
            <button onClick={createRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold">Создать</button>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-xl mb-3">Войти в группу</h2>
            <input value={joinId} onChange={e => setJoinId(e.target.value)}
              placeholder="ID комнаты" className="w-full p-3 rounded-lg bg-gray-700 mb-3 outline-none" />
            <button onClick={() => joinRoom()}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold">Войти</button>
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}