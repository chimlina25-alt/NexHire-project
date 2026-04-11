const fs = require('fs');
const path = require('path');

const filePath = 'd:/Training_Project/nexhire-web/app/(employer_dashboard)/post_job/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/setActiveTab\('draft'\)/g, "setActiveTab('drafts')");
content = content.replace(/a === 'post'/g, "activeTab === 'post'");
content = content.replace(/view === 'draft'/g, "activeTab === 'drafts'");
content = content.replace(/drafts\.length/g, "draftData.length");
content = content.replace(/\{drafts\.map\(\(draft\)/g, "{draftData.map((draft)");

// Fix the trailing syntax error ))
content = content.replace(/            \)\)\n          <\/div>/g, "          </div>");

fs.writeFileSync(filePath, content);
console.log('Fixed post_job/page.tsx errors!');
