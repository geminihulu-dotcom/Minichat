// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeJp3VrtjJWcjZNs8QfXxz8weShp32wVM",
  authDomain: "minichat-03097761-de523.firebaseapp.com",
  databaseURL: "https://minichat-03097761-de523-default-rtdb.firebaseio.com",
  projectId: "minichat-03097761-de523",
  storageBucket: "minichat-03097761-de523.firebasestorage.app",
  messagingSenderId: "344460343083",
  appId: "1:344460343083:web:8c4c3332d3b56f235cb76e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, analytics };