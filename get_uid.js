import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, '773303455@kayansoft.com', '0808kayan')
  .then(userCred => {
    console.log("UID:", userCred.user.uid);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
