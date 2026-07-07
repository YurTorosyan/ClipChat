import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, limit
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';

export default function useChatSync(roomId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = [];
      snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  const sendText = useCallback(async (text) => {
    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      type: 'text',
      text,
      senderId: auth.currentUser?.uid || 'anon',
      timestamp: serverTimestamp(),
    });
  }, [roomId]);

  const sendFileSignal = useCallback(async (fileName, fileSize, fileType, peerId, localId) => {
    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      type: 'file_signal',
      fileName,
      fileSize,
      fileType,
      peerId,
      localId: localId || null,   // для сопоставления на стороне отправителя
      senderId: auth.currentUser?.uid || 'anon',
      timestamp: serverTimestamp(),
    });
  }, [roomId]);

  return { messages, sendText, sendFileSignal, loading };
}