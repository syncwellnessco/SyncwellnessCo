import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.R2_BUCKET_NAME || 'syncwellnessco-media';

const programVideos = [
  'videos/programs/0e93b350-77af-48a8-b289-a8eee6732a69-14-day-gut-cleanse.mp4',
  'videos/programs/5a9a1432-f8ec-4edc-9fe8-fce346d95c15-four-week-metabolic-kickstarter.mp4',
  'videos/programs/cf83339d-6531-43cd-909b-ecc12acfb20e-hormone-harmony.mp4'
];

async function optimizeProgramVideos() {
  const tmpDir = '/tmp/r2_program_faststart';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  for (const key of programVideos) {
    console.log(`\n=== Processing ${key} ===`);
    const fileName = path.basename(key);
    const rawPath = path.join(tmpDir, `raw_${fileName}`);
    const optPath = path.join(tmpDir, `opt_${fileName}`);

    console.log('Downloading from R2...');
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const writeStream = fs.createWriteStream(rawPath);
    await new Promise((res, rej) => {
      getRes.Body.pipe(writeStream);
      writeStream.on('finish', res);
      writeStream.on('error', rej);
    });

    console.log('Applying FastStart with FFmpeg...');
    execSync(`ffmpeg -i "${rawPath}" -c copy -movflags +faststart "${optPath}" -y`, { stdio: 'inherit' });

    // Validate moov in first 64KB
    const fd = fs.openSync(optPath, 'r');
    const headBuf = Buffer.alloc(65536);
    fs.readSync(fd, headBuf, 0, 65536, 0);
    fs.closeSync(fd);

    const moovPos = headBuf.indexOf('moov');
    if (moovPos === -1) {
      console.error(`ERROR: moov atom NOT found in first 64KB for ${key}! Aborting upload.`);
      continue;
    }
    console.log(`CONFIRMED: moov atom found at byte ${moovPos} for ${key}`);

    console.log('Uploading back to R2...');
    const optBuffer = fs.readFileSync(optPath);
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: optBuffer,
      ContentType: 'video/mp4',
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    console.log(`SUCCESS: ${key} optimized and uploaded! Size: ${(optBuffer.length / (1024*1024)).toFixed(2)} MB`);

    // Clean up
    fs.unlinkSync(rawPath);
    fs.unlinkSync(optPath);
  }

  console.log('\nAll program videos have been FastStart optimized!');
}

optimizeProgramVideos().catch(console.error);
