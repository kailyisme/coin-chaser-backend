import firebase from "firebase"

const firebaseConfig = {
  apiKey: "AIzaSyCYcbkha1XvRg6_tcxPT1ofFHI8QX3ROxA",
  authDomain: "coin-chaser-f3a38.firebaseapp.com",
  databaseURL:
    "https://coin-chaser-f3a38-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "coin-chaser-f3a38",
  storageBucket: "coin-chaser-f3a38.appspot.com",
  messagingSenderId: "427490146338",
  appId: "1:427490146338:web:e81cb1b7337822e87ab27b",
  measurementId: "G-VX1ZNJ1LWH",
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;
