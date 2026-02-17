import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBnHba2lvT-FEkXbb5cS8PPRnCuCUNdVCk",
  authDomain: "nexiai-59052.firebaseapp.com",
  projectId: "nexiai-59052",
  storageBucket: "nexiai-59052.firebasestorage.app",
  messagingSenderId: "76408736177",
  appId: "1:76408736177:web:6e26e50914d262e4571590"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
