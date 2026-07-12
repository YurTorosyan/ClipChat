import { useState } from 'react';
import FileTransferCard from './FileTransferCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github, dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import hljs from 'highlight.js/lib/common';

const isValidURL = (text) => /^https?:\/\/[^\s]+$/.test(text.trim());

const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return null;
  try {
    const result = hljs.highlightAuto(text, [
      'javascript', 'typescript', 'python', 'html', 'css',
      'cpp', 'csharp', 'json', 'xml', 'bash', 'sql', 'plaintext'
    ]);
    return result.language && result.language !== 'plaintext' ? result.language : null;
  } catch (e) {
    return null;
  }
};

export default function MessageItem({ message, requestFile, sentFiles, currentUserId }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const { dark } = useTheme();

  const copy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openLink = () => {
    if (message.text && isValidURL(message.text)) {
      window.open(message.text.trim(), '_blank', 'noopener,noreferrer');
    }
  };

  if (message.type === 'file_signal') {
    const localFile = message.localId && message.senderId === currentUserId
      ? sentFiles?.get(message.localId)
      : null;
    return <FileTransferCard message={message} requestFile={requestFile} localFile={localFile} />;
  }

  const isLink = message.text && isValidURL(message.text);
  const codeLanguage = !isLink && message.text ? detectLanguage(message.text) : null;
  const codeStyle = dark ? dracula : github;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 max-w-full break-words shadow-sm">
      <div className="flex items-start justify-between gap-2">
        {/* Основной контент сообщения – сжимаемый flex-элемент */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {codeLanguage ? (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              {/* Плашка с названием языка */}
              <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 font-mono">
                {codeLanguage.toUpperCase()}
              </div>
              {/* Контейнер с относительным позиционированием и ограничением ширины */}
              <div className="relative w-full max-w-full overflow-hidden">
                {/* Оборачиваем подсветку в блок с автоматическим переносом строк */}
                <div className="overflow-x-auto">
                  <SyntaxHighlighter
                    language={codeLanguage}
                    style={codeStyle}
                    wrapLongLines={true}             // <-- главное исправление
                    customStyle={{
                      margin: 0,
                      padding: '12px',
                      paddingRight: '60px', // отступ для кнопок
                      background: 'transparent',
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',       // запасной вариант
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    codeTagProps={{
                      style: { fontFamily: "'Fira Code', monospace" },
                    }}
                  >
                    {message.text}
                  </SyntaxHighlighter>
                </div>
                {/* Sticky-кнопки */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                  {isLink && (
                    <button
                      onClick={openLink}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title={t('openInBrowser') || 'Открыть в браузере'}
                      aria-label={t('openInBrowser') || 'Открыть в браузере'}
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                    </button>
                  )}
                  <button
                    onClick={copy}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={copied ? t('copied') : t('copy')}
                    aria-label={copied ? t('copied') : t('copy')}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} size="xs" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          )}
        </div>

        {/* Кнопки для обычных сообщений (не кода) */}
        {!codeLanguage && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {isLink && (
              <button
                onClick={openLink}
                className="p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                title={t('openInBrowser') || 'Открыть в браузере'}
                aria-label={t('openInBrowser') || 'Открыть в браузере'}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
              </button>
            )}
            <button
              onClick={copy}
              className={`p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ${copied ? 'text-green-500' : ''}`}
              title={copied ? t('copied') : t('copy')}
              aria-label={copied ? t('copied') : t('copy')}
            >
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {!codeLanguage && (
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
          {message.timestamp?.toDate?.().toLocaleTimeString() || ''}
        </div>
      )}
    </div>
  );
}