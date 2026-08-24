import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const unsub2 = onSnapshot(collection(db, 'subscriptions'), 
  (snap) => {
    console.log("SUCCESS SUBS");
    process.exit(0);
  },
  (err) => {
    console.error("ERROR SUBS:", err.message);
    process.exit(0);
  }
);
