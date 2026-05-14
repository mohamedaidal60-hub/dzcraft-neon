const fs = require('fs');
const txt = fs.readFileSync('../farah2/supabase_dump.json', 'utf8');
const count = (txt.match(/"price_cents"/g) || []).length;
console.log('Products count in dump:', count);

const stories = fs.readFileSync('../farah2/supabase_stories.json', 'utf8');
const storiesCount = (stories.match(/"title"/g) || []).length;
console.log('Stories count in dump:', storiesCount);
