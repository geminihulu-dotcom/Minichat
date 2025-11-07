// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeJp3VrtjJWcjZNs8QfXxz8weShp32wVM",
  authDomain: "minichat-03097761-de523.firebaseapp.com",
  databaseURL: "https://minichat-03097761-de523-default-rtdb.firebaseio.com",
  projectId: "minichat-03097761-de523",
  storageBucket: "minichat-03097761-de523.appspot.com",
  messagingSenderId: "344460343083",
  appId: "1:344460343083:web:5d9006fb8a024af05cb76e"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); 
}

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db };
