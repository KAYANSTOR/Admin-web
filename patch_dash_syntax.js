import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Fix the syntax error in the useEffect block
content = content.replace(
  `      setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
      });
    }

    return () => {`,
  `      setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
    });
    }

    return () => {`
);

content = content.replace(
  `      setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
    });
    }

    return () => {`,
  `      setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
      });
    }

    return () => {`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
