import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

async function testCreate() {
  try {
    // 1. Log in admin on primary auth
    await signInWithEmailAndPassword(auth, '773303455@kayansoft.com', '0808kayan');
    console.log("Admin Logged in primary auth");
    
    const phone = "771122334"; // unique phone
    const generatedEmail = `${phone}@kayansoft.com`;
    const generatedPassword = `1234kayan`;
    
    // 2. Create user on secondary auth
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, generatedEmail, generatedPassword);
    console.log("Secondary Auth created:", userCred.user.uid);
    
    // 3. Write to Firestore using primary auth context (which db uses)
    await setDoc(doc(db, 'users', userCred.user.uid), {
        name: "Test Client",
        phone: phone,
        pin: "1234",
        email: generatedEmail,
        status: 'ACTIVE',
        isActive: true,
        is_active: true,
        commissionPercentage: 0,
        commission_rate: 0,
        role: 'NETWORK_OWNER',
        deviceLimit: 3
    });
    console.log("Firestore write success");
    
  } catch (err) {
    console.error("Test failed:", err);
  }
  process.exit(0);
}
testCreate();
