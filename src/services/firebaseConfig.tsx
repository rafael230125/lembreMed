import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection,getDocs, query, where } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3i1Sv8ELJLYQD8hEKxaNPMaPR1NYJYY8",
  authDomain: "lembremed-f7ec3.firebaseapp.com",
  projectId: "lembremed-f7ec3",
  storageBucket: "lembremed-f7ec3.firebasestorage.app",
  messagingSenderId: "46126987899",
  appId: "1:46126987899:web:5484365fe25057749300de"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const db = getFirestore(app);
export { db, collection, getDocs, query, where};