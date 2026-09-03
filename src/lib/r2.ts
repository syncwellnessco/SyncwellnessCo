import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (s3ClientInstance) return s3ClientInstance;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 credentials are missing. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your environment."
    );
  }

  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3ClientInstance;
}

export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not set in environment variables.");
  }
  return bucket;
}

export function getR2PublicBaseUrl(): string {
  const url =
    process.env.R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    "";
  return url.replace(/\/+$/, "");
}

export function formatR2PublicUrl(key: string): string {
  const baseUrl = getR2PublicBaseUrl();
  const cleanKey = key.replace(/^\/+/, "");
  if (!baseUrl) {
    // If no public base URL is configured, return the key or a root-relative path
    return `/${cleanKey}`;
  }
  return `${baseUrl}/${cleanKey}`;
}

export function extractR2Key(urlOrKey: string): string {
  if (!urlOrKey) return "";
  
  // If it's already a relative path / key
  if (!urlOrKey.startsWith("http://") && !urlOrKey.startsWith("https://")) {
    return urlOrKey.replace(/^\/+/, "");
  }

  try {
    const parsed = new URL(urlOrKey);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return urlOrKey.replace(/^\/+/, "");
  }
}

export function sanitizeFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  const name = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
  const ext = lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : "";

  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  return `${cleanName}${ext}`;
}

export interface PresignUploadOptions {
  filename: string;
  contentType: string;
  folder?: string;
  expiresIn?: number;
}

export interface PresignUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function generatePresignedUploadUrl({
  filename,
  contentType,
  folder = "general",
  expiresIn = 3600,
}: PresignUploadOptions): Promise<PresignUploadResult> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  const isVideo = contentType.startsWith("video/");
  const mediaType = isVideo ? "videos" : "images";
  const cleanFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "uploads";
  const safeName = sanitizeFilename(filename || (isVideo ? "video.mp4" : "image.jpg"));
  const uniqueId = crypto.randomUUID();
  const key = `${mediaType}/${cleanFolder}/${uniqueId}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = formatR2PublicUrl(key);

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}

export async function uploadBufferToR2({
  buffer,
  filename,
  contentType,
  folder = "general",
}: {
  buffer: Buffer | Uint8Array;
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<{ publicUrl: string; key: string }> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  const isVideo = contentType.startsWith("video/");
  const mediaType = isVideo ? "videos" : "images";
  const cleanFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "uploads";
  const safeName = sanitizeFilename(filename || (isVideo ? "video.mp4" : "image.jpg"));
  const uniqueId = crypto.randomUUID();
  const key = `${mediaType}/${cleanFolder}/${uniqueId}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);
  const publicUrl = formatR2PublicUrl(key);

  return {
    publicUrl,
    key,
  };
}

export async function deleteFromR2(urlOrKey: string): Promise<{ success: boolean; key: string }> {
  const key = extractR2Key(urlOrKey);
  if (!key) {
    throw new Error("Invalid object key or URL provided for deletion.");
  }

  const client = getR2Client();
  const bucket = getR2BucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
  return { success: true, key };
}
