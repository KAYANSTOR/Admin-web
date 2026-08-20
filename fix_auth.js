import fs from 'fs';
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

content = content.replace(
  `name: "jar",`,
  `name: name,`
);

content = content.replace(
  `            } else {
              // Document deleted
              firebaseSignOut(auth).then(() => {
                setUser(null);
                localStorage.removeItem('kayan_user');
                setErrorMsg('حسابك غير موجود.');
              });
            }`,
  `            } else {
              // Document deleted or not created yet
              setUser((prev) => {
                if (prev) {
                  firebaseSignOut(auth).then(() => {
                    localStorage.removeItem('kayan_user');
                    setErrorMsg('حسابك غير موجود.');
                  });
                }
                return null;
              });
            }`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
