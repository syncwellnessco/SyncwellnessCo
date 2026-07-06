const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data } = await supabase.from("programs").select("*");
  console.log("ALL SLUGS:", data.map(d => d.slug));
  const p = data.find(p => (p.slug || "").toLowerCase() === "metabolic-kickstarter");
  console.log("FOUND:", !!p);
  if (p) console.log("STATUS:", p.status);
}
test();
