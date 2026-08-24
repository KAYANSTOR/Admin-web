import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testWrite() {
  try {
    await signInWithEmailAndPassword(auth, '773303455@kayansoft.com', '0808kayan');
    console.log("Logged in");
    await setDoc(doc(db, 'users', 'test_doc_123'), { name: "test" });
    console.log("Write success");
  } catch (err) {
    console.error("Write failed:", err.message);
  }
  process.exit(0);
}
testWrite();
