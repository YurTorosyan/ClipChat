import { db } from '../services/firebase';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

async function deleteRoomFromFirestore(roomId) {
  try {
    const messagesCol = collection(db, 'rooms', roomId, 'messages');
    const msgSnapshot = await getDocs(messagesCol);
    await Promise.all(msgSnapshot.docs.map(d => deleteDoc(d.ref)));

    const presenceCol = collection(db, 'rooms', roomId, 'presence');
    const presSnapshot = await getDocs(presenceCol);
    await Promise.all(presSnapshot.docs.map(d => deleteDoc(d.ref)));

    await deleteDoc(doc(db, 'rooms', roomId));
  } catch (err) {
    console.error('Failed to delete room:', err);
  }
}

export default function RoomList({ rooms, onEnter, onDelete }) {
  const { t } = useLanguage();

  if (rooms.length === 0) return null;

  const handleDelete = async (roomId) => {
    onDelete(roomId);
    await deleteRoomFromFirestore(roomId);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl mb-6 shadow-md">
      <h2 className="text-xl mb-4 font-semibold">{t('yourRooms')}</h2>
      <ul className="space-y-3">
        {rooms.map(room => (
          <li key={room.id} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="overflow-hidden mr-2">
              <p className="font-medium truncate">{room.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ID: {room.id}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEnter(room.id)}
                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all hover:scale-110 active:scale-95 text-blue-600 dark:text-blue-400"
                title={t('enter')}
              >
                <FontAwesomeIcon icon={faArrowRight} className="text-lg" />
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:scale-110 active:scale-95 text-red-600 dark:text-red-400"
                title={t('delete')}
              >
                <FontAwesomeIcon icon={faTrashAlt} className="text-lg" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}