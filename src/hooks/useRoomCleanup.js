import { useEffect } from 'react';
import { db } from '../services/firebase';
import {
  doc, getDoc, updateDoc, collection, getDocs,
  deleteDoc, serverTimestamp
} from 'firebase/firestore';

const TTL_HOURS = 24;

export default function useRoomCleanup(roomId) {
  useEffect(() => {
    const cleanup = async () => {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const lastActivity = data.updatedAt?.toDate() || data.createdAt?.toDate();
      if (!lastActivity) return;

      const hoursPassed = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
      if (hoursPassed > TTL_HOURS) {
        // Удаляем все сообщения
        const messagesCol = collection(db, 'rooms', roomId, 'messages');
        const msgSnapshot = await getDocs(messagesCol);
        const msgDeletions = msgSnapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(msgDeletions);

        // Обновляем время активности, чтобы не удалять сразу снова
        await updateDoc(roomRef, { updatedAt: serverTimestamp() });
        console.log(`Room ${roomId} cleaned (TTL ${TTL_HOURS}h)`);
      }
    };

    cleanup();
  }, [roomId]);
}