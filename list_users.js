const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const app = initializeApp({
  projectId: 'netcard-pro'
});
const db = getFirestore(app);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  users.forEach(u => {
    console.log(u.id, u.data().phone, u.data().name, u.data().role);
  });
}
run();
