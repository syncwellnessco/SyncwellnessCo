import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { uploadBufferToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const contentType = file.type || "application/octet-stream";
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and videos are supported." },
        { status: 400 }
      );
    }

    const isPublicReviewUpload = folder === "reviews" && isImage;
    const isAdmin = session?.user?.user_metadata?.role === "admin";

    if (!isAdmin && !isPublicReviewUpload) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let uploadBuffer = buffer;
    if (isVideo) {
      try {
        const inPath = `/tmp/faststart_in_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
        const outPath = `/tmp/faststart_out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
        const fs = await import("fs");
        const { execSync } = await import("child_process");
        fs.writeFileSync(inPath, buffer);
        execSync(`ffmpeg -i "${inPath}" -c copy -movflags +faststart "${outPath}" -y`, { stdio: "ignore" });
        uploadBuffer = fs.readFileSync(outPath);
        try {
          fs.unlinkSync(inPath);
          fs.unlinkSync(outPath);
        } catch {}
      } catch (ffErr) {
        console.warn("Auto FastStart failed, using original video buffer:", ffErr);
      }
    }

    const result = await uploadBufferToR2({
      buffer: uploadBuffer,
      filename: file.name,
      contentType,
      folder,
    });

    return NextResponse.json({
      url: result.publicUrl,
      key: result.key,
    });
  } catch (error: any) {
    console.error("Server upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to storage." },
      { status: 500 }
    );
  }
}
