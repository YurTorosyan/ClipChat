// hooks/useP2PFileTransfer.js
import { useRef, useCallback, useEffect } from 'react';
import { getPeer } from '../services/peerService';

const CHUNK_SIZE = 16 * 1024; // 16 КБ

export default function useP2PFileTransfer() {
  const incomingFile = useRef({ chunks: [], fileName: '', fileSize: 0, received: 0 });

  // Инициация отправки файла получателем (кнопка "Скачать")
  const requestFile = useCallback((senderPeerId, onProgress) => {
    const peer = getPeer();
    if (!peer) return Promise.reject('Нет подключения');

    return new Promise((resolve, reject) => {
      const conn = peer.connect(senderPeerId, { reliable: true });
      conn.on('open', () => {
        conn.send({ type: 'request_file' });
      });

      const chunks = [];
      let receivedSize = 0;
      let metadata = null;

      conn.on('data', (data) => {
        if (data.type === 'file_metadata') {
          metadata = data;
          onProgress({ status: 'started', fileName: data.fileName, total: data.fileSize });
        } else if (data.type === 'chunk') {
          chunks.push(data.chunk);
          receivedSize += data.chunk.byteLength;
          onProgress({ status: 'progress', received: receivedSize, total: metadata.fileSize });
          // Отправляем подтверждение
          conn.send({ type: 'ack', received: receivedSize });
        } else if (data.type === 'end') {
          const blob = new Blob(chunks, { type: metadata.fileType });
          const url = URL.createObjectURL(blob);
          resolve({ url, fileName: metadata.fileName, blob });
          conn.close();
        }
      });

      conn.on('error', (err) => reject(err));
    });
  }, []);

  // Обработчик входящего соединения от получателя (на стороне отправителя)
  const setupIncomingConnection = useCallback((conn, fileToSend) => {
    let offset = 0;
    conn.on('data', (data) => {
      if (data.type === 'request_file') {
        // Отправляем метаданные
        conn.send({
          type: 'file_metadata',
          fileName: fileToSend.name,
          fileSize: fileToSend.size,
          fileType: fileToSend.type
        });
        // Начинаем отправку чанков
        sendChunks(fileToSend, conn, offset);
      } else if (data.type === 'ack') {
        offset = data.received;
        sendChunks(fileToSend, conn, offset);
      }
    });

    const sendChunks = (file, conn, startOffset) => {
      const slice = file.slice(startOffset, startOffset + CHUNK_SIZE);
      if (slice.size === 0) {
        conn.send({ type: 'end' });
        return;
      }
      slice.arrayBuffer().then(buffer => {
        conn.send({ type: 'chunk', chunk: buffer });
      });
    };
  }, []);

  return { requestFile, setupIncomingConnection };
}