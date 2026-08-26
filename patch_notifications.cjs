const fs = require('fs');

let content = fs.readFileSync('src/pages/NotificationsManager.tsx', 'utf8');

// Add state for clients
const importRegex = /import \{ doc, setDoc, addDoc, collection, serverTimestamp \} from 'firebase\/firestore';/;
const importReplacement = `import { doc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';`;
content = content.replace(importRegex, importReplacement);

const stateVars = `
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => {
    const fetchClients = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'NETWORK_OWNER'));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setClients(list);
    };
    fetchClients();
  }, []);
`;
content = content.replace(/const \[isLoading, setIsLoading\] = useState\(false\);/, 'const [isLoading, setIsLoading] = useState(false);\n' + stateVars);

// Replace the Select options
const oldSelectOptions = `<option value="ALL">الجميع (All)</option>
                <option value="UNPAID_SUB">غير المسددين للاشتراك</option>
                <option value="UNPAID_COMM">المتأخرين عن دفع العمولات</option>
                <option value="UNSETTLED">الحسابات غير المصفاة</option>`;
                
const newSelectOptions = `<option value="ALL">إشعار عام للجميع</option>
                <optgroup label="تخصيص لعميل محدد">
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name || 'عميل غير مسمى'} - {c.phone}</option>
                  ))}
                </optgroup>`;
content = content.replace(oldSelectOptions, newSelectOptions);

fs.writeFileSync('src/pages/NotificationsManager.tsx', content);
