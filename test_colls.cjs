const fs = require("fs");
const token = fs.readFileSync("auth.json", "utf8").match(/"idToken": "(.*?)"/)[1];

async function check() {
  const colls = ["networks", "Network", "Serials", "Subscriptions", "Commissions"];
  for (const c of colls) {
    const url = "https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/documents/" + c;
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      console.log(`${c} exists with ${data.documents.length} docs.`);
    } else {
      console.log(`${c} is empty or doesn't exist.`);
    }
  }
}
check();
