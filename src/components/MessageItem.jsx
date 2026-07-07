import { useState } from 'react';
import FileTransferCard from './FileTransferCard';

export default function MessageItem({ message, requestFile, sentFiles, currentUserId }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Если это сигнал о файле
  if (message.type === 'file_signal') {
    // Проверяем, есть ли локальный файл у отправителя
    const localFile = message.localId && message.senderId === currentUserId
      ? sentFiles?.get(message.localId)
      : null;

    return (
      <FileTransferCard
        message={message}
        requestFile={requestFile}
        localFile={localFile}
      />
    );
  }

  // Текстовое сообщение
  return (
    <div className="bg-gray-800 rounded-xl p-3 max-w-full break-words">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm whitespace-pre-wrap flex-1">{message.text}</p>
        <button onClick={copy}
          className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 whitespace-nowrap">
          {copied ? '✓' : '📋'}
        </button>
      </div>
      <div className="text-right text-xs text-gray-500 mt-1">
        {message.timestamp?.toDate?.().toLocaleTimeString() || ''}
      </div>
    </div>
  );
}