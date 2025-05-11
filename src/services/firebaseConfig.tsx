import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZb9M_n7UXfUcLIAW09m0JDQGRzCjCny8",
  authDomain: "did-i-forgot-app.firebaseapp.com",
  projectId: "did-i-forgot-app",
  storageBucket: "did-i-forgot-app.firebasestorage.app",
  messagingSenderId: "1061811257129",
  appId: "1:1061811257129:web:1ccc1a89c3987501290138"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const db = getFirestore(app);
export { db };