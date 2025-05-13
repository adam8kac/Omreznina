import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAW3qZtjqE7Cuzit3Tc9xVdkkSfy5DNnsc",
  authDomain: "omreznina-5ccf2.firebaseapp.com",
  projectId: "omreznina-5ccf2",
  storageBucket: "omreznina-5ccf2.firebasestorage.app",
  messagingSenderId: "314421485150",
  appId: "1:314421485150:web:f180bbbb18b78e4536decf",
  measurementId: "G-C4KK8424QP",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { auth };
