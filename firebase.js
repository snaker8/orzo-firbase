import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, updatePassword } from 'firebase/auth';

// [TODO] Replace with your Firebase Project Configuration
// You can find this in Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyArKZ0M7vynyaG6zpGNUvUhR-DKYbg1L2U",
    authDomain: "orzo-analysis.firebaseapp.com",
    projectId: "orzo-analysis",
    storageBucket: "orzo-analysis.firebasestorage.app",
    messagingSenderId: "794070417576",
    appId: "1:794070417576:web:4fa9d88ef8c5efdd24029d",
    measurementId: "G-JSNTRR1KJ5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export {
    db, storage, auth,
    collection, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp,
    ref, uploadBytes, getDownloadURL,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, updatePassword
};
