// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDBLREU1FWSnePHj4LKsJREzcN325s19tE",
  authDomain: "clip2chat.firebaseapp.com",
  projectId: "clip2chat",
  storageBucket: "clip2chat.firebasestorage.app",
  messagingSenderId: "879037949902",
  appId: "1:879037949902:web:d37ac90999fbde78be6d9f",
  measurementId: "G-BRXE614XFM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const ensureAnonymousAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) resolve(user);
      else signInAnonymously(auth).then(cred => resolve(cred.user));
      unsubscribe();
    });
  });
};
