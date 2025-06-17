import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmC4RJfJrNYdKjQCOQJPiqtpfopuV9A-8",
  authDomain: "dj-streaming-app-a0ac6.firebaseapp.com",
  projectId: "dj-streaming-app-a0ac6",
  storageBucket: "dj-streaming-app-a0ac6.firebasestorage.app",
  messagingSenderId: "95125895809",
  appId: "1:95125895809:web:fede5c0f4c182bb16eeb80",
  measurementId: "G-KMP03TGZC7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
