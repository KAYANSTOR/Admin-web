const fs = require("fs");
const token = fs.readFileSync("auth.json", "utf8").match(/"idToken": "(.*?)"/)[1];

async function check() {
  const colls = ["admins", "app_settings", "clients", "network", "notifications", "settings", "users"];
  for (const c of colls) {
    const url = "https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/documents/" + c;
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      let oldest = data.documents[0].createTime;
      data.documents.forEach(d => {
        if (d.createTime < oldest) oldest = d.createTime;
      });
      console.log(`${c} has ${data.documents.length} docs. Oldest createTime: ${oldest}`);
    } else {
      console.log(`${c} is empty or doesn't exist.`);
    }
  }
}
check();
