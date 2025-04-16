// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDlLEYaaYiCJs1d57ToJb0dQ_fLTc2jTjg",
  authDomain: "music-guessing-game-a7236.firebaseapp.com",
  projectId: "music-guessing-game-a7236",
  storageBucket: "music-guessing-game-a7236.appspot.com",
  messagingSenderId: "991893518943",
  appId: "1:991893518943:web:3a2ca6bf6bfe95028cb9ea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
