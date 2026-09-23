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

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const OLD_URL_PREFIX = 'https://pub-ecd642596b8647569354aba1cd5c5bc8.r2.dev';
const NEW_URL_PREFIX = 'https://media.syncwellnessco.com';

async function migratePrograms() {
  console.log('Fetching programs...');
  const { data: programs, error } = await client.from('programs').select('*');
  if (error) {
    console.error('Error fetching programs:', error);
    return;
  }

  for (const prog of programs) {
    let hero = prog.hero;
    let modified = false;

    if (hero) {
      if (typeof hero === 'string') {
        try {
          hero = JSON.parse(hero);
        } catch {}
      }

      if (hero.introVideo && hero.introVideo.includes(OLD_URL_PREFIX)) {
        hero.introVideo = hero.introVideo.replace(OLD_URL_PREFIX, NEW_URL_PREFIX);
        modified = true;
      }
      if (hero.bannerImage && hero.bannerImage.includes(OLD_URL_PREFIX)) {
        hero.bannerImage = hero.bannerImage.replace(OLD_URL_PREFIX, NEW_URL_PREFIX);
        modified = true;
      }
    }

    if (modified) {
      console.log(`Updating program ${prog.title} (${prog.id})...`);
      const { error: updateError } = await client
        .from('programs')
        .update({ hero })
        .eq('id', prog.id);

      if (updateError) {
        console.error(`Failed to update program ${prog.id}:`, updateError);
      } else {
        console.log(`Successfully updated program ${prog.title}`);
      }
    } else {
      console.log(`Program ${prog.title} has no legacy URLs.`);
    }
  }
}

migratePrograms().catch(console.error);
