// services/uploadService.js
const API_KEY = '6d207e02198a847aa98d0a2a901485a5'; // получить на https://freeimage.host/page/api

export const uploadImageToHost = async (file) => {
  const form = new FormData();
  form.append('key', API_KEY);
  form.append('action', 'upload');
  form.append('source', file);
  form.append('format', 'json');

  const res = await fetch('https://freeimage.host/api/1/upload', {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (data.status_code === 200 && data.image) {
    return data.image.url; // прямая ссылка
  }
  throw new Error(data.status_txt || 'Ошибка загрузки изображения');
};