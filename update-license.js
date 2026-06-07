const fs = require('fs') 
const path = 'apps/quality-flow-ng-app/src/license-devextreme.ts'; 
const key = process.env.DEVEXTREME_KEY ?? ''; 

fs.writeFileSync(path, `export const DEVEXTREME_LICENCE = '${key}';`, { flag: 'w' });
