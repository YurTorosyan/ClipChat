import { useState, useRef } from 'react';

export default function ChatInput({ onSendText, onSendFile }) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const send = () => {
    if (text.trim()) {
      onSendText(text.trim());
      setText('');
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    onSendFile(file);
  };

  return (
    <div
      className={`p-3 border-t border-gray-700 bg-gray-800 ${dragOver ? 'bg-blue-900/30' : ''}`}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="flex items-center gap-2">
        <button onClick={() => fileInputRef.current.click()} className="text-xl p-2 rounded hover:bg-gray-700" title="Прикрепить файл">📎</button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Текст или ссылка..." rows={1}
          className="flex-1 bg-gray-700 rounded-lg p-2 resize-none outline-none" />
        <button onClick={send} disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold">Отправить</button>
      </div>
    </div>
  );
}