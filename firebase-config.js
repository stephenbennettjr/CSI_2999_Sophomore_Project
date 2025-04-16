// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    "[pull from API]"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db };
