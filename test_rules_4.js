import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot, collectionGroup } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const unsub2 = onSnapshot(collection(db, 'commissions'), 
  (snap) => {
    console.log("SUCCESS COMMISSIONS");
    process.exit(0);
  },
  (err) => {
    console.error("ERROR COMMISSIONS:", err.message);
    process.exit(0);
  }
);
