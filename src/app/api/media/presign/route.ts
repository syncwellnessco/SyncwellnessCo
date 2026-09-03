import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generatePresignedUploadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const body = await request.json();
    const { filename, contentType, folder = "general" } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and contentType are required." },
        { status: 400 }
      );
    }

    // Validate MIME types
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and videos are supported." },
        { status: 400 }
      );
    }

    // Public review photo submissions are allowed for 'reviews' folder, all other folders require admin session
    const isPublicReviewUpload = folder === "reviews" && isImage;
    const isAdmin = session?.user?.user_metadata?.role === "admin";

    if (!isAdmin && !isPublicReviewUpload) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const presignedData = await generatePresignedUploadUrl({
      filename,
      contentType,
      folder,
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json(presignedData);
  } catch (error: any) {
    console.error("Presign upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presigned upload URL." },
      { status: 500 }
    );
  }
}
