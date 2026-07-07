import { useEffect } from 'react';
import { db } from '../services/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const TTL_HOURS = 24;

export default function useRoomCleanup(roomId) {
  useEffect(() => {
    const checkAndClean = async () => {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const updatedAt = data.updatedAt?.toDate() || data.createdAt?.toDate();
      if (!updatedAt) return;

      const hoursPassed = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursPassed > TTL_HOURS) {
        // Удаляем все сообщения
        const messagesCol = collection(db, 'rooms', roomId, 'messages');
        const messageDocs = await getDocs(messagesCol);
        const deletePromises = messageDocs.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        // Обновляем время активности
        await updateDoc(roomRef, { updatedAt: serverTimestamp() });

        console.log('Комната очищена (TTL)');
        // При необходимости можно уведомить пользователя
      }
    };

    checkAndClean();
  }, [roomId]);
}