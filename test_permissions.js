import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testSettings() {
  try {
    await signInWithEmailAndPassword(auth, '773303455@kayansoft.com', '0808kayan');
    console.log("Logged in successfully");
    
    const globalRef = doc(db, 'app_settings', 'global_config');
    const globalSnap = await getDoc(globalRef);
    console.log("Read global config success. Exists:", globalSnap.exists());
    
    await setDoc(doc(db, 'settings', 'app_settings'), { test_connection: true }, { merge: true });
    console.log("Write settings success");
    
  } catch (err) {
    console.error("Failed:", err.message);
  }
  process.exit(0);
}
testSettings();
