import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { createPeer } from '../services/peerService';
import useChatSync from '../hooks/useChatSync';
import usePresence from '../hooks/usePresence';
import useP2PFileTransfer from '../hooks/useP2PFileTransfer';
import useRoomCleanup from '../hooks/useRoomCleanup';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import AdUnit from './AdUnit';
import { useLanguage } from '../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCopy, faQrcode } from '@fortawesome/free-solid-svg-icons';

export default function Room() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') || 'Комната';
  const [roomExists, setRoomExists] = useState(true);
  const [qrValue, setQrValue] = useState('');
  const { t } = useLanguage();

  const sentFiles = useRef(new Map());

  useEffect(() => {
    setQrValue(window.location.href);
    getDoc(doc(db, 'rooms', roomId)).then(snap => {
      if (!snap.exists()) setRoomExists(false);
    });
  }, [roomId]);

  const deviceId = useRef(localStorage.getItem('deviceId') || Math.random().toString(36).substr(2, 9));
  useEffect(() => { localStorage.setItem('deviceId', deviceId.current); }, []);

  const peerId = `${roomId}-${deviceId.current}`;
  const peer = useRef(null);
  useEffect(() => {
    peer.current = createPeer(peerId);
    return () => peer.current?.destroy();
  }, [peerId]);

  useRoomCleanup(roomId);
  const { messages, sendText, sendFileSignal, loading } = useChatSync(roomId);
  const onlineCount = usePresence(roomId);
  const { requestFile, setupIncomingConnection } = useP2PFileTransfer();

  useEffect(() => {
    peer.current?.on('connection', (conn) => {
      if (window._p2pFileToSend) {
        setupIncomingConnection(conn, window._p2pFileToSend);
      }
    });
  }, [setupIncomingConnection]);

  const handleSendFile = async (file) => {
    const localId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sentFiles.current.set(localId, file);
    window._p2pFileToSend = file;
    await sendFileSignal(file.name, file.size, file.type, peerId, localId);
  };

  if (!roomExists) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white text-xl">
        {t('roomNotFound')} <Link to="/" className="ml-2 underline text-blue-500">{t('goHome')}</Link>
      </div>
    );
  }

  const currentUserId = auth.currentUser?.uid || 'anon';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white flex flex-col transition-colors">
      <header className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 text-gray-600 dark:text-gray-300"
            title={t('back')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{roomName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {roomId} · {t('online')}: {onlineCount}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(qrValue); alert(t('copyLink')); }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 text-gray-600 dark:text-gray-300"
            title={t('copyLink')}
          >
            <FontAwesomeIcon icon={faCopy} className="text-xl" />
          </button>
          <button
            onClick={() => document.getElementById('qr-modal').showModal()}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 text-gray-600 dark:text-gray-300"
            title={t('qrCode')}
          >
            <FontAwesomeIcon icon={faQrcode} className="text-xl" />
          </button>
          <dialog id="qr-modal" className="rounded-xl p-4 bg-white dark:bg-gray-800 text-black dark:text-white shadow-2xl backdrop:bg-black/50">
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={qrValue}
                size={200}
                bgColor={document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'}
                fgColor={document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'}
              />
              <p className="mt-2 text-sm">{t('qrCode')}</p>
              <button
                onClick={() => document.getElementById('qr-modal').close()}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {t('close')}
              </button>
            </div>
          </dialog>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-48 bg-gray-50 dark:bg-gray-800/50 p-3 items-center justify-center border-r border-gray-200 dark:border-gray-700">
          <AdUnit type="sidebar" />
        </aside>

        <main className="flex-1 flex flex-col min-h-0">
          <MessageList
            messages={messages}
            loading={loading}
            requestFile={requestFile}
            sentFiles={sentFiles.current}
            currentUserId={currentUserId}
          />
          <ChatInput onSendText={sendText} onSendFile={handleSendFile} />
          <div className="lg:hidden">
            <AdUnit type="banner" />
          </div>
        </main>
      </div>
    </div>
  );
}