import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  const tables = ['blogs', 'programs', 'reviews', 'video_testimonials', 'ebook_requests', 'contact_enquiries'];
  for (const table of tables) {
    const { data, error } = await client.from(table).select('*');
    if (error) {
      console.log(`Table ${table} error:`, error.message);
      continue;
    }
    let found = 0;
    for (const row of data) {
      const rowStr = JSON.stringify(row);
      if (rowStr.includes('r2.dev') || rowStr.includes('pub-')) {
        found++;
        console.log(`\nFound legacy r2.dev in [${table}] row id: ${row.id || row.slug}`);
        for (const [k, v] of Object.entries(row)) {
          const valStr = typeof v === 'string' ? v : JSON.stringify(v);
          if (valStr && (valStr.includes('r2.dev') || valStr.includes('pub-'))) {
            console.log(`  field '${k}': ${valStr.substring(0, 150)}`);
          }
        }
      }
    }
    console.log(`Table [${table}]: found ${found} rows with legacy r2.dev URLs.`);
  }
}

checkAll().catch(console.error);
