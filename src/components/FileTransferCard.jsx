import { useState } from 'react';
import AdUnit from './AdUnit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function FileTransferCard({ message, requestFile, localFile }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);
  const { t } = useLanguage();

  const isImage = message.fileType?.startsWith('image/');
  const localPreviewUrl = localFile ? URL.createObjectURL(localFile) : null;

  const startDownload = async () => {
    if (downloading || blobUrl || localFile) return;
    setDownloading(true);
    setStatus(t('connecting'));
    try {
      const result = await requestFile(message.peerId, (p) => {
        if (p.status === 'started') setStatus(`${t('receiving')} ${p.fileName}`);
        else if (p.status === 'progress') {
          const perc = Math.round((p.received / p.total) * 100);
          setProgress(perc);
          setStatus(`${t('receiving')} ${perc}%`);
        }
      });
      setBlobUrl(result.url);
      setStatus(t('ready'));
      if (!isImage) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.fileName;
        a.click();
      }
    } catch (err) {
      setStatus(`${t('error')}: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium truncate">{message.fileName}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          {message.fileSize > 1024 * 1024
            ? (message.fileSize / 1024 / 1024).toFixed(1) + ' MB'
            : (message.fileSize / 1024).toFixed(1) + ' KB'}
        </span>
      </div>

      {localPreviewUrl && isImage && (
        <div className="mb-3">
          <img
            src={localPreviewUrl}
            alt="preview"
            className="max-h-48 rounded-lg object-cover cursor-pointer"
            onClick={() => window.open(localPreviewUrl, '_blank')}
          />
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('localPreview')}</p>
        </div>
      )}

      {!localPreviewUrl && blobUrl && isImage && (
        <div className="mb-3">
          <img
            src={blobUrl}
            alt="downloaded"
            className="max-h-48 rounded-lg object-cover cursor-pointer"
            onClick={() => window.open(blobUrl, '_blank')}
          />
        </div>
      )}

      {!localFile && !downloading && !blobUrl && (
        <button
          onClick={startDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faDownload} />
          {isImage ? t('downloadImage') : t('download')}
        </button>
      )}

      {downloading && (
        <div className="space-y-2 mt-3">
          <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
            <span>{status}</span><span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
          <AdUnit type="infeed" />
        </div>
      )}

      {blobUrl && !isImage && (
        <div className="text-green-600 dark:text-green-400 text-sm mt-2 flex items-center gap-1">
          <FontAwesomeIcon icon={faCheckCircle} />
          {t('fileReady')} <a href={blobUrl} download className="underline">{t('clickToDownload')}</a>
        </div>
      )}
    </div>
  );
}