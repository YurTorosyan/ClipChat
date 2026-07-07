export default function RoomList({ rooms, onEnter, onDelete }) {
  if (rooms.length === 0) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-2xl mb-6">
      <h2 className="text-xl mb-4">Ваши комнаты</h2>
      <ul className="space-y-3">
        {rooms.map(room => (
          <li key={room.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-xs text-gray-400">ID: {room.id}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEnter(room.id)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                Войти
              </button>
              <button onClick={() => onDelete(room.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}