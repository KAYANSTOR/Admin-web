import fs from 'fs';

let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Add error handler to onSnapshot
content = content.replace(
  /unsubscribeDoc = onSnapshot\(q, \(snapshot\) => \{([\s\S]*?)\}\);/g,
  `unsubscribeDoc = onSnapshot(q, (snapshot) => {
            $1
          }, (error) => {
            console.error("Firestore onSnapshot permission error:", error);
          });`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
