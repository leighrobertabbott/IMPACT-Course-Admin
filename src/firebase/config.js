import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1OtaVxfGUEMlDFxGYqX6YWxfSomL9-ac",
  authDomain: "mwl-impact.firebaseapp.com",
  projectId: "mwl-impact",
  storageBucket: "mwl-impact.firebasestorage.app",
  messagingSenderId: "1068856174628",
  appId: "1:1068856174628:web:c61d6ab3d573928ee950b1",
  measurementId: "G-JMVD092V71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

export default app;
