import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChatInput({ onSendText, onSendFile }) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useLanguage();

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
      className={`p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors ${dragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 text-gray-500 dark:text-gray-400"
          title={t('attach')}
        >
          <FontAwesomeIcon icon={faPaperclip} className="text-xl" />
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={t('textPlaceholder')}
          rows={1}
          className="flex-1 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg p-2 resize-none outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          title={t('send')}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
        </button>
      </div>
    </div>
  );
}