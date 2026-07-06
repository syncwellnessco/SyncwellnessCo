import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { seedPrograms } from "@/data/seed-programs";

function mapProgramToDb(program: any): any {
  const dbObj = { ...program };
  if (dbObj.shortDescription !== undefined) {
    dbObj.shortdescription = dbObj.shortDescription;
    delete dbObj.shortDescription;
  }
  if (dbObj.problemsSolved !== undefined) {
    dbObj.problemssolved = dbObj.problemsSolved;
    delete dbObj.problemsSolved;
  }
  if (dbObj.createdAt !== undefined) {
    dbObj.createdat = dbObj.createdAt;
    delete dbObj.createdAt;
  }
  if (dbObj.updatedAt !== undefined) {
    dbObj.updatedat = dbObj.updatedAt;
    delete dbObj.updatedAt;
  }
  if (dbObj.showOnHome !== undefined) {
    dbObj.showonhome = dbObj.showOnHome;
    delete dbObj.showOnHome;
  }
  return dbObj;
}

export async function POST() {
  try {
    const supabase = await createClient();

    const dbPrograms = seedPrograms.map(mapProgramToDb);

    // In a real application, you might want to truncate or upsert.
    // For this migration, we'll try to upsert by id.
    const { data, error } = await supabase
      .from("programs")
      .upsert(dbPrograms, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
