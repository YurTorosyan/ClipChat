import os

structure = [
    "src",
    "src/components",
    "src/hooks",
    "src/App.jsx",
    "src/firebase.js",
    "src/index.css",
    "src/main.jsx",
    "src/components/AdPlaceholder.jsx",
    "src/components/ChatInput.jsx",
    "src/components/Home.jsx",
    "src/components/MessageItem.jsx",
    "src/components/MessageList.jsx",
    "src/components/Room.jsx",
    "src/hooks/useChatSync.js",
    "src/hooks/usePresence.js",
    "src/hooks/useRoomCleanup.js"
]

for path in structure:
    if path.endswith('/') or '.' not in path.split('/')[-1]:
        os.makedirs(path, exist_ok=True)
    else:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'a').close()
print("Структура создана.")