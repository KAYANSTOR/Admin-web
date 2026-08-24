import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAdmins() {
  const adminsSnap = await getDocs(collection(db, 'admins'));
  console.log("Admins count:", adminsSnap.size);
  adminsSnap.forEach(d => console.log(d.id, d.data()));
}
checkAdmins();
