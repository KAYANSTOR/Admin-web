const fs = require('fs');
let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

content = content.replace(
  /\{isEditModalOpen && \(/,
  '</div>\n      </div>\n      {isEditModalOpen && ('
);

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
