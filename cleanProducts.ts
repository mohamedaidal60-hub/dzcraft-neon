import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);

async function main() {
  console.log("Fetching products...");
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  for (const p of data) {
    if (p.name.toLowerCase().includes('kabyle') || p.name.toLowerCase().includes('robe')) {
      console.log('Deleting', p.name);
      await supabase.from('products').delete().eq('id', p.id);
    }
  }
  console.log("Done");
}

main();
