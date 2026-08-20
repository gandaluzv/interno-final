import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHQwEtn56fYMhqgtQf0D1I1hlh4Tn9KOU",
  authDomain: "interno-62da9.firebaseapp.com",
  projectId: "interno-62da9",
  storageBucket: "interno-62da9.appspot.com",
  messagingSenderId: "329995153822",
  appId: "1:329995153822:web:d738d4bc1791f5cd1f668f",
  measurementId: "G-T3K8JJK99Q"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
