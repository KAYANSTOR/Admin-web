const fs = require("fs");
const token = fs.readFileSync("auth.json", "utf8").match(/"idToken": "(.*?)"/)[1];
const url = "https://firestore.googleapis.com/v1/projects/netcard-pro/databases/(default)/collectionGroups/sales/documents";
fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
  .then(r => r.json())
  .then(console.log);
