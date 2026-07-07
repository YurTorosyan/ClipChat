import { useState } from 'react';
import AdPlaceholder from './AdPlaceholder';

export default function FileTransferCard({ message, requestFile, localFile }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const isImage = message.fileType?.startsWith('image/');

  // Если файл есть локально (отправитель), сразу показываем превью
  const localPreviewUrl = localFile ? URL.createObjectURL(localFile) : null;

  const startDownload = async () => {
    if (downloading || blobUrl || localFile) return;
    setDownloading(true);
    setStatus('Подключение...');
    try {
      const result = await requestFile(message.peerId, (p) => {
        if (p.status === 'started') setStatus(`Получение ${p.fileName}`);
        else if (p.status === 'progress') {
          const perc = Math.round((p.received / p.total) * 100);
          setProgress(perc);
          setStatus(`Получение ${perc}%`);
        }
      });
      setBlobUrl(result.url);
      setStatus('Готово');
      // Автоскачивание для не-изображений
      if (!isImage) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.fileName;
        a.click();
      }
    } catch (err) {
      setStatus('Ошибка: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium truncate">{message.fileName}</span>
        <span className="text-sm text-gray-400 ml-2">
          {message.fileSize > 1024 * 1024
            ? (message.fileSize / 1024 / 1024).toFixed(1) + ' MB'
            : (message.fileSize / 1024).toFixed(1) + ' KB'}
        </span>
      </div>

      {/* Превью для изображения, если доступно локально или уже скачано */}
      {(localPreviewUrl && isImage) && (
        <div className="mb-3">
          <img
            src={localPreviewUrl}
            alt="preview"
            className="max-h-48 rounded-lg object-cover cursor-pointer"
            onClick={() => window.open(localPreviewUrl, '_blank')}
          />
          <p className="text-xs text-green-400 mt-1">Локальное превью (файл не загружен на сервер)</p>
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
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          {isImage ? 'Скачать изображение' : 'Скачать (P2P)'}
        </button>
      )}

      {downloading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-300">
            <span>{status}</span><span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <AdPlaceholder type="infeed" />
        </div>
      )}

      {blobUrl && !isImage && (
        <div className="text-green-400 text-sm mt-2">
          Файл готов. <a href={blobUrl} download className="underline">Нажмите для скачивания</a>
        </div>
      )}
    </div>
  );
}