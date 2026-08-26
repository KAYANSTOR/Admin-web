import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
});
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  await signInWithEmailAndPassword(auth, "773303455@kayansoft.com", "0808kayan");
  
  const collectionsToClean = ['serials', 'subscriptions', 'licenses'];
  
  for (const coll of collectionsToClean) {
    const snap = await getDocs(collection(db, coll));
    console.log(`Found ${snap.size} docs in ${coll}`);
    for (const doc of snap.docs) {
      await deleteDoc(doc.ref);
      console.log(`Deleted ${doc.id} from ${coll}`);
    }
  }
  process.exit(0);
}
main();
