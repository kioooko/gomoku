// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-wQviLX5Fg7VejMdlhGZUkOFkVXmiI-U",
  authDomain: "project-4985760607655592059.firebaseapp.com",
  projectId: "project-4985760607655592059",
  storageBucket: "project-4985760607655592059.firebasestorage.app",
  messagingSenderId: "258159442839",
  appId: "1:258159442839:web:b25c019b63eaa2e393e2d2",
  measurementId: "G-MJ6XLRV760"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export for use in other files
window.firebaseApp = app;
window.firebaseAnalytics = analytics;
