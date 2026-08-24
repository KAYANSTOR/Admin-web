import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, '773303455@kayansoft.com', '0808kayan');
    console.log("Auth success!");
    const qs = await getDocs(query(collection(db, 'users'), where("phone", "==", "773303455")));
    console.log("Success. Empty:", qs.empty);
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
test();
