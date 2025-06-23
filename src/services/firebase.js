import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check' // Optional, enable if you use App Check

const firebaseConfig = {
  apiKey: "AIzaSyDdG1jk003OjmChVrUUkk2EGA5Vcer-aS4",
  authDomain: "goldcare-1955f.firebaseapp.com",
   projectId: "goldcare-1955f",
  storageBucket: "goldcare-1955f.firebasestorage.app",
  messagingSenderId: "797397756299",
  appId: "1:797397756299:web:0ff798de635d02d0a9678e",
  measurementId: "G-6Z8G8MJ9PE"
};

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Optional: Enable App Check if you have a reCAPTCHA key
// initializeAppCheck(app, {
//   provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_KEY'),
//   isTokenAutoRefreshEnabled: true,
// })

export { app, analytics, auth, db, storage }
