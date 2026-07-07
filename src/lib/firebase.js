import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // 👈 इथे बदल केला
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBk62AQYBDKWtei92NrxUS58w9kqMuL5rg",
  authDomain: "leafshield-ai.firebaseapp.com",
  projectId: "leafshield-ai",
  storageBucket: "leafshield-ai.firebasestorage.app",
  messagingSenderId: "290068680861",
  appId: "1:290068680861:web:2b2b9f63df9ce0e60bc474",
  measurementId: "G-0XWZC905CM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider(); // 👈 हा नवीन एक्सपोर्ट ॲड केला
export default app;