import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPfG429mRPu_NKWQ41khPHKi003af1tQw",
  authDomain: "megpt-3822f.firebaseapp.com",
  databaseURL: "https://megpt-3822f-default-rtdb.firebaseio.com",
  projectId: "megpt-3822f",
  storageBucket: "megpt-3822f.firebasestorage.app",
  messagingSenderId: "242113326869",
  appId: "1:242113326869:web:588b5c5c8a5e124a07031c",
  measurementId: "G-MBRGDQSYVG"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
