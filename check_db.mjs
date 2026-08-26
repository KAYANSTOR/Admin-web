import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
});
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  await signInWithEmailAndPassword(auth, "773303455@kayansoft.com", "0808kayan");
  const subs = await getDocs(collection(db, "subscriptions"));
  console.log("Subscriptions count:", subs.size);
  const serials = await getDocs(collection(db, "serials"));
  console.log("Serials count:", serials.size);
  process.exit(0);
}
main();
