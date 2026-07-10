import { useState } from 'react';
import FileTransferCard from './FileTransferCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function MessageItem({ message, requestFile, sentFiles, currentUserId }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const copy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (message.type === 'file_signal') {
    const localFile = message.localId && message.senderId === currentUserId
      ? sentFiles?.get(message.localId)
      : null;
    return <FileTransferCard message={message} requestFile={requestFile} localFile={localFile} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 max-w-full break-words shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm whitespace-pre-wrap flex-1">{message.text}</p>
        <button
          onClick={copy}
          className={`p-1 rounded-full transition-all hover:scale-110 active:scale-95 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ${copied ? 'text-green-500' : ''}`}
          title={copied ? t('copied') : t('copy')}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-sm" />
        </button>
      </div>
      <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
        {message.timestamp?.toDate?.().toLocaleTimeString() || ''}
      </div>
    </div>
  );
}