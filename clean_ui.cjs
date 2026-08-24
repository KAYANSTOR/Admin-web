const fs = require('fs');

let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/\{\/\* Index Error Alert \*\/\}.*?\{\/\* Hero Revenue Card \*\/\}/s, "{/* Hero Revenue Card */}");
dashboard = dashboard.replace(/const \[indexError, setIndexError\].*?\n/, "");
dashboard = dashboard.replace(/if \(error\.message \&\& error\.message\.includes.*?\}.*?\n/s, "");
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

let sales = fs.readFileSync('src/pages/Sales.tsx', 'utf8');
sales = sales.replace(/\{indexError \&\& \([\s\S]*?\}\)/, "");
sales = sales.replace(/const \[indexError, setIndexError\].*?\n/, "");
sales = sales.replace(/if \(e\.message \&\& e\.message\.includes.*?\}.*?\n/s, "");
fs.writeFileSync('src/pages/Sales.tsx', sales);
