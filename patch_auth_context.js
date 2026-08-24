import fs from 'fs';

let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// The snapshot listener needs to NOT throw unhandled errors that break React.
content = content.replace(
  /unsubscribeDoc = onSnapshot\(q, \(snapshot\) => \{([\s\S]*?)\}, \(error\) => \{[\s\S]*?\}\);/g,
  `unsubscribeDoc = onSnapshot(q, (snapshot) => {
            $1
          }, (error) => {
            console.error("Firestore onSnapshot permission error:", error);
            setErrorMsg("خطأ في صلاحيات قاعدة البيانات (Firestore). يرجى التأكد من تحديث قواعد الأمان كما هو موضح.");
            setLoading(false);
          });`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
