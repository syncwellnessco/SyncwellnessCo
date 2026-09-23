import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { execSync } from "child_process";
import fs from "fs";
import { pipeline } from "stream/promises";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

async function checkNeedsFastStart(key) {
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Range: "bytes=0-2048",
      })
    );
    const chunks = [];
    for await (const c of res.Body) chunks.push(c);
    const buf = Buffer.concat(chunks);
    return !buf.includes("moov");
  } catch (err) {
    return true;
  }
}

async function optimizeAll() {
  console.log("Connecting to Cloudflare R2 bucket:", BUCKET);
  const listRes = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "videos/testimonials/",
    })
  );

  const items = (listRes.Contents || []).filter((item) => item.Key && item.Key.endsWith(".mp4"));
  console.log(`Found ${items.length} testimonial videos.`);

  for (let i = 0; i < items.length; i++) {
    const key = items[i].Key;
    const filename = key.split("/").pop();
    const sizeMb = (items[i].Size / (1024 * 1024)).toFixed(1);

    const needsIt = await checkNeedsFastStart(key);
    if (!needsIt) {
      console.log(`[${i + 1}/${items.length}] Skipping ${filename} (${sizeMb} MB) - already has FastStart.`);
      continue;
    }

    console.log(`\n[${i + 1}/${items.length}] Optimizing ${filename} (${sizeMb} MB)...`);
    const inPath = `/tmp/opt_in_${i}.mp4`;
    const outPath = `/tmp/opt_out_${i}.mp4`;

    const getRes = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    await pipeline(getRes.Body, fs.createWriteStream(inPath));
    console.log(`  -> Downloaded.`);

    execSync(`ffmpeg -i "${inPath}" -c copy -movflags +faststart "${outPath}" -y`, { stdio: "ignore" });
    console.log(`  -> FastStart applied with ffmpeg.`);

    const fileStream = fs.createReadStream(outPath);
    const stat = fs.statSync(outPath);

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileStream,
        ContentLength: stat.size,
        ContentType: "video/mp4",
      })
    );
    console.log(`  -> Re-uploaded to R2 (${(stat.size / 1024 / 1024).toFixed(1)} MB).`);

    try {
      fs.unlinkSync(inPath);
      fs.unlinkSync(outPath);
    } catch {}
  }

  console.log("\n🎉 All testimonial videos now have FastStart enabled for instant streaming!");
}

optimizeAll().catch((err) => {
  console.error("Error optimizing videos:", err);
  process.exit(1);
});
