import { getAllPrograms } from "./src/lib/programs";
async function check() {
  const p = await getAllPrograms();
  console.log(p.map(x => ({id: x.id, slug: x.slug})));
}
check();
