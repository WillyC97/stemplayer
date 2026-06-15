import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBDsDu4vhzx_ltqK5kxw_XnQKw5UP4svPo",
    authDomain: "layers-audio.firebaseapp.com",
    projectId: "layers-audio",
    storageBucket: "layers-audio.firebasestorage.app",
    messagingSenderId: "346928453705",
    appId: "1:346928453705:web:4508495b79130484fd8798",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, storage, db };