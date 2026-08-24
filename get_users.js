import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getUsers() {
  const usersSnap = await getDocs(collection(db, 'users'));
  usersSnap.forEach(d => console.log(d.id, d.data()));
  process.exit(0);
}
getUsers();
