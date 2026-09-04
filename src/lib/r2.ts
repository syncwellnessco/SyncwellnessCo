import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
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

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0 || !Number.isFinite(bytes) || bytes < 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm))} ${sizes[safeIndex]}`;
}

export interface MediaCategoryStats {
  count: number;
  bytes: number;
  formattedSize: string;
  percentageOfTotalBytes: number;
  percentageOfTotalCount: number;
  avgSizeBytes: number;
  formattedAvgSize: string;
}

export interface MediaStorageStats {
  totalCount: number;
  totalBytes: number;
  formattedTotalSize: string;
  images: MediaCategoryStats;
  videos: MediaCategoryStats;
  others: MediaCategoryStats;
  latestUpload?: {
    key: string;
    size: number;
    formattedSize: string;
    lastModified?: string;
    type: "image" | "video" | "other";
  } | null;
  bucketName: string;
  updatedAt: string;
  configured: boolean;
  error?: string;
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp", "tiff", "ico"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "mkv", "avi", "m4v", "ogv", "3gp", "wmv"]);

export function categorizeMediaKey(key: string): "image" | "video" | "other" {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.startsWith("images/")) return "image";
  if (lowerKey.startsWith("videos/")) return "video";

  const ext = lowerKey.split(".").pop() || "";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";

  return "other";
}

export async function getMediaStorageStats(): Promise<MediaStorageStats> {
  const defaultStats: MediaStorageStats = {
    totalCount: 0,
    totalBytes: 0,
    formattedTotalSize: "0 B",
    images: {
      count: 0,
      bytes: 0,
      formattedSize: "0 B",
      percentageOfTotalBytes: 0,
      percentageOfTotalCount: 0,
      avgSizeBytes: 0,
      formattedAvgSize: "0 B",
    },
    videos: {
      count: 0,
      bytes: 0,
      formattedSize: "0 B",
      percentageOfTotalBytes: 0,
      percentageOfTotalCount: 0,
      avgSizeBytes: 0,
      formattedAvgSize: "0 B",
    },
    others: {
      count: 0,
      bytes: 0,
      formattedSize: "0 B",
      percentageOfTotalBytes: 0,
      percentageOfTotalCount: 0,
      avgSizeBytes: 0,
      formattedAvgSize: "0 B",
    },
    latestUpload: null,
    bucketName: process.env.R2_BUCKET_NAME || "syncwellnessco-media",
    updatedAt: new Date().toISOString(),
    configured: false,
  };

  try {
    const client = getR2Client();
    const bucket = getR2BucketName();

    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    let imageCount = 0;
    let imageBytes = 0;
    let videoCount = 0;
    let videoBytes = 0;
    let otherCount = 0;
    let otherBytes = 0;

    let latestItem: {
      key: string;
      size: number;
      lastModified?: Date;
      type: "image" | "video" | "other";
    } | null = null;

    while (isTruncated) {
      const response: ListObjectsV2CommandOutput = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          ContinuationToken: continuationToken,
        })
      );

      const contents = response.Contents || [];

      for (const item of contents) {
        if (!item.Key) continue;
        const size = item.Size || 0;
        const type = categorizeMediaKey(item.Key);

        if (type === "image") {
          imageCount++;
          imageBytes += size;
        } else if (type === "video") {
          videoCount++;
          videoBytes += size;
        } else {
          otherCount++;
          otherBytes += size;
        }

        if (
          !latestItem ||
          (item.LastModified && latestItem.lastModified && item.LastModified > latestItem.lastModified) ||
          (item.LastModified && !latestItem.lastModified)
        ) {
          latestItem = {
            key: item.Key,
            size,
            lastModified: item.LastModified,
            type,
          };
        }
      }

      isTruncated = !!response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }

    const totalCount = imageCount + videoCount + otherCount;
    const totalBytes = imageBytes + videoBytes + otherBytes;

    const calcCategory = (count: number, bytes: number): MediaCategoryStats => ({
      count,
      bytes,
      formattedSize: formatBytes(bytes),
      percentageOfTotalBytes: totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
      percentageOfTotalCount: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
      avgSizeBytes: count > 0 ? Math.round(bytes / count) : 0,
      formattedAvgSize: count > 0 ? formatBytes(Math.round(bytes / count)) : "0 B",
    });

    return {
      totalCount,
      totalBytes,
      formattedTotalSize: formatBytes(totalBytes),
      images: calcCategory(imageCount, imageBytes),
      videos: calcCategory(videoCount, videoBytes),
      others: calcCategory(otherCount, otherBytes),
      latestUpload: latestItem
        ? {
            key: latestItem.key,
            size: latestItem.size,
            formattedSize: formatBytes(latestItem.size),
            lastModified: latestItem.lastModified?.toISOString(),
            type: latestItem.type,
          }
        : null,
      bucketName: bucket,
      updatedAt: new Date().toISOString(),
      configured: true,
    };
  } catch (err: any) {
    console.error("Failed to load R2 media storage stats:", err);
    return {
      ...defaultStats,
      error: err.message || "Failed to load storage statistics",
    };
  }
}

