const fs = require('fs');

let content = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const importReplacement = `import { useLocation, useNavigate } from 'react-router-dom';`;
content = content.replace(/import \{ useNavigate \} from 'react-router-dom';/, importReplacement);

const fetchReplacement = `
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterParam = searchParams.get('filter');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesQuery = query(collectionGroup(db, 'sales'), orderBy('createdAt', 'desc'), limit(500));
        const snap = await getDocs(salesQuery);
        let allSales: any[] = [];
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        
        snap.forEach(d => {
          const data = d.data();
          if (filterParam === 'today' && data.createdAt < startOfDay) return;
          if (filterParam === 'month' && data.createdAt < startOfMonth) return;
          
          allSales.push({ id: d.id, ...data });
        });
        
        setSales(allSales);
      } catch (e: any) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchSales();
  }, [filterParam]);
`;
content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, fetchReplacement.trim());

fs.writeFileSync('src/pages/Sales.tsx', content);
