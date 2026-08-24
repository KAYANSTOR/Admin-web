import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot, collectionGroup } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tests = [
  { name: "users", ref: collection(db, 'users') },
  { name: "subscriptions", ref: collection(db, 'subscriptions') },
  { name: "commissions", ref: collection(db, 'commissions') },
  { name: "sales_group", ref: collectionGroup(db, 'sales') }
];

let completed = 0;

tests.forEach(t => {
  const unsub = onSnapshot(t.ref, 
    (snap) => {
      console.log(`SUCCESS: ${t.name} (size: ${snap.size})`);
      completed++;
      if(completed === tests.length) process.exit(0);
    },
    (err) => {
      console.error(`ERROR ${t.name}:`, err.message);
      completed++;
      if(completed === tests.length) process.exit(0);
    }
  );
});

// timeout
setTimeout(() => {
  console.log("Timeout reached");
  process.exit(1);
}, 5000);
