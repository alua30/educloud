// Firebase бұлттық сервисіне қосылу
// Төмендегі мәндерді Firebase Console → Project settings → Your apps → Web app бөлімінен көшіріп қойыңыз
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyCtGK-UvdZB604eiYg2G43KUs730etESKk",

    authDomain: "educloud-34b3e.firebaseapp.com",

    projectId: "educloud-34b3e",

    storageBucket: "educloud-34b3e.firebasestorage.app",

    messagingSenderId: "520349176327",

    appId: "1:520349176327:web:35f03e29e5ffa8c8d090a2",

    measurementId: "G-L2XQ447BQJ"

  };


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);       // Firebase Authentication — тіркелу және кіру
export const db = getFirestore(app);    // Cloud Firestore — бұлттық дерекқор
