const fs = require('fs');
const path = require('path');

const fixFile = (p) => {
  if (!p.endsWith('.ts')) return;
  let c = fs.readFileSync(p, 'utf8');
  
  // Fix imports
  c = c.replace(/import { Client } from 'pg';/g, "import pkg from 'pg';\nconst { Client } = pkg;");
  c = c.replace(/import { Pool } from 'pg';/g, "import pkg from 'pg';\nconst { Pool } = pkg;");
  
  // Fix variable names
  c = c.replace(/process.env.NEON_DATABASE_URL/g, 'process.env.DATABASE_URL');
  
  // Fix implicit any in forEach/map by adding type
  c = c.replace(/\((r|item|acc)\) =>/g, "($1: any) =>");
  
  fs.writeFileSync(p, c);
};

const walk = (d) => {
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else fixFile(p);
  });
};

walk('../farah2/api');
walk('./api');
