import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fetch from "node-fetch";

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  projectId: "netcard-pro",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  try {
    const userCred = await signInWithEmailAndPassword(auth, "773303455@kayansoft.com", "0808kayan");
    const token = await userCred.user.getIdToken();
    
    // List root collections
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/documents:listCollectionIds`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await res.json();
    console.log("Root Collections:", data);
    
    if (data.collectionIds) {
      for (const coll of data.collectionIds) {
        console.log(`\nFetching sample from collection: ${coll}`);
        const collRes = await fetch(`https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/documents/${coll}?pageSize=3`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const collData = await collRes.json();
        console.log(JSON.stringify(collData, null, 2));
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
