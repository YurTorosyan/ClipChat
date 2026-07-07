import { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import AdPlaceholder from './AdPlaceholder';

export default function MessageList({ messages, loading, requestFile, sentFiles, currentUserId }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400">Загрузка...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && <p className="text-center text-gray-500">Пока пусто...</p>}
      {messages.map((msg, idx) => (
        <div key={msg.id}>
          <MessageItem
            message={msg}
            requestFile={requestFile}
            sentFiles={sentFiles}
            currentUserId={currentUserId}
          />
          {(idx + 1) % 7 === 0 && idx !== messages.length - 1 && (
            <div className="my-3"><AdPlaceholder type="infeed" /></div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}