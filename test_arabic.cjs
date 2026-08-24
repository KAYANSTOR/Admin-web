const fs = require("fs");
const token = fs.readFileSync("auth.json", "utf8").match(/"idToken": "(.*?)"/)[1];

async function check() {
  const colls = ["المشرفون", "العملاء", "المستخدمون", "شبكة"];
  for (const c of colls) {
    const url = "https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/documents/" + encodeURIComponent(c) + "?pageSize=1";
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const data = await res.json();
    console.log(`Response for ${c}:`, Object.keys(data));
    if (data.documents) {
      console.log(`Found: ${c}`);
      console.log(data.documents[0].name);
    }
  }
}
check();
