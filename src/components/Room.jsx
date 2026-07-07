import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { createPeer } from '../services/peerService';
import useChatSync from '../hooks/useChatSync';
import usePresence from '../hooks/usePresence';
import useP2PFileTransfer from '../hooks/useP2PFileTransfer';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import AdPlaceholder from './AdPlaceholder';

export default function Room() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') || 'Комната';
  const [roomExists, setRoomExists] = useState(true);
  const [qrValue, setQrValue] = useState('');

  // Локальное хранилище отправленных файлов (localId -> File)
  const sentFiles = useRef(new Map());

  useEffect(() => {
    setQrValue(window.location.href);
    getDoc(doc(db, 'rooms', roomId)).then(snap => {
      if (!snap.exists()) setRoomExists(false);
    });
  }, [roomId]);

  // Анонимный ID устройства + Peer
  const deviceId = useRef(localStorage.getItem('deviceId') || Math.random().toString(36).substr(2, 9));
  useEffect(() => { localStorage.setItem('deviceId', deviceId.current); }, []);

  const peerId = `${roomId}-${deviceId.current}`;
  const peer = useRef(null);
  useEffect(() => {
    peer.current = createPeer(peerId);
    return () => peer.current?.destroy();
  }, [peerId]);

  const { messages, sendText, sendFileSignal, loading } = useChatSync(roomId);
  const onlineCount = usePresence(roomId);
  const { requestFile, setupIncomingConnection } = useP2PFileTransfer();

  // Обработчик входящих P2P соединений (для отправки файла получателю)
  useEffect(() => {
    peer.current?.on('connection', (conn) => {
      // Получаем файл, который ждёт отправки (может быть сохранён глобально)
      if (window._p2pFileToSend) {
        setupIncomingConnection(conn, window._p2pFileToSend);
      }
    });
  }, [setupIncomingConnection]);

  // Отправка любого файла (текст, изображение, видео, архив...)
  const handleSendFile = async (file) => {
    // Генерируем локальный ID для сопоставления на стороне отправителя
    const localId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    // Сохраняем файл в локальное хранилище
    sentFiles.current.set(localId, file);
    // Глобально сохраняем для отправки через P2P, если получатель подключится
    window._p2pFileToSend = file;

    await sendFileSignal(file.name, file.size, file.type, peerId, localId);
  };

  if (!roomExists) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white text-xl">
        Комната не найдена. <a href="/" className="ml-2 underline text-blue-400">На главную</a>
      </div>
    );
  }

  const currentUserId = auth.currentUser?.uid || 'anon';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{roomName}</h1>
          <p className="text-xs text-gray-400">ID: {roomId} · Онлайн: {onlineCount}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard.writeText(qrValue); alert('Ссылка скопирована!'); }}
            className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Копировать ссылку</button>
          <button onClick={() => document.getElementById('qr-modal').showModal()}
            className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">QR-код</button>
          <dialog id="qr-modal" className="rounded-xl p-4 bg-gray-800 text-white">
            <div className="flex flex-col items-center">
              <QRCodeSVG value={qrValue} size={200} />
              <p className="mt-2 text-sm">Отсканируйте для входа</p>
              <button onClick={() => document.getElementById('qr-modal').close()}
                className="mt-3 bg-blue-600 px-4 py-2 rounded">Закрыть</button>
            </div>
          </dialog>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-48 bg-gray-800/50 p-3 items-center justify-center border-r border-gray-700">
          <AdPlaceholder type="sidebar" />
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
            <AdPlaceholder type="banner" />
          </div>
        </main>
      </div>
    </div>
  );
}