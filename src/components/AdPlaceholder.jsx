export default function AdPlaceholder({ type }) {
  const styles = {
    sidebar: 'h-full min-h-[200px] w-full',
    banner: 'h-16 w-full',
    infeed: 'h-24 w-full bg-gray-700/50 rounded-xl'
  };
  const label = {
    sidebar: 'Реклама (Sidebar)',
    banner: 'Мобильный баннер',
    infeed: 'Реклама в ленте'
  };
  return (
    <div className={`${styles[type]} border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-sm`}>
      {label[type]}
    </div>
  );
}