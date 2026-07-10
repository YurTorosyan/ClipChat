import { useEffect, useRef } from 'react';

export default function AdUnit({ type }) {
  const adRef = useRef(null);
  
  // Определяем конфигурацию для разных мест
  const config = {
    sidebar: {
      slot: '9127958667', // замените на ваш ID слота боковой панели
      format: 'auto',
      style: { width: '160px', height: '600px' },
      className: 'h-full min-h-[200px] w-full',
    },
    banner: {
      slot: '3608038671', // ваш ID мобильного баннера
      format: 'auto',
      style: { width: '100%', height: '50px' },
      className: 'w-full h-16',
    },
    infeed: {
      slot: '1331440687', // ваш ID в ленте
      format: 'auto',
      style: { width: '100%', height: '100px' },
      className: 'w-full h-24 bg-transparent rounded-xl',
    },
  };

  const current = config[type] || config.infeed;

  useEffect(() => {
    // Если скрипт уже загружен, показываем рекламу
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Adsense error', e);
      }
    }
  }, []);

  return (
    <div className={current.className} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={current.style}
        data-ad-client="ca-pub-3866897159870461" // ваш общий client ID
        data-ad-slot={current.slot}
        data-ad-format={current.format}
        data-full-width-responsive="true"
      />
    </div>
  );
}