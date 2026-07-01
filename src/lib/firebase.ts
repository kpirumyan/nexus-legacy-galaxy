import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId provided in the config
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
const auth = getAuth(app);

export { app, db, auth };
