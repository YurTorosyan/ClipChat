// hooks/usePresence.js
import { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function usePresence(roomId) {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = doc(collection(db, 'rooms', roomId, 'presence'), uid);

    const update = () => setDoc(ref, { uid, lastSeen: serverTimestamp() }, { merge: true });
    update();
    const interval = setInterval(update, 10000);
    const cleanup = () => deleteDoc(ref).catch(() => {});
    window.addEventListener('beforeunload', cleanup);

    const unsub = onSnapshot(collection(db, 'rooms', roomId, 'presence'), (snap) => {
      let active = 0;
      const now = Date.now();
      snap.forEach(d => {
        const t = d.data().lastSeen?.toMillis?.();
        if (t && now - t < 15000) active++;
      });
      setOnlineCount(active || 1);
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
      unsub();
    };
  }, [roomId]);

  return onlineCount;
}