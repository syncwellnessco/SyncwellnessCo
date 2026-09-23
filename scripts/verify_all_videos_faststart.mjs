import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.R2_BUCKET_NAME || 'syncwellnessco-media';

const allVideos = [
  // 14 testimonials
  'videos/testimonials/355419e8-7835-4c6b-bf3d-f803901383c8-shivali.mp4',
  'videos/testimonials/36de5488-8de3-44e1-b81f-8643e6927372-hina-testimonial.mp4',
  'videos/testimonials/4200190b-0b30-46f8-a307-eb3cd5a08003-sonia-testimonial.mp4',
  'videos/testimonials/4b9c4dbe-d7f9-4618-bf02-1b2fda473088-neelam-testimonial.mp4',
  'videos/testimonials/59ffd3ac-ae27-46cb-94ed-5fbf0590cdc6-simmi.mp4',
  'videos/testimonials/5ed06905-771c-4a2c-83f4-cffe26318067-saba.mp4',
  'videos/testimonials/6353d9f9-8156-447c-be40-808d460e6a24-shiksha-testimonial.mp4',
  'videos/testimonials/6eececd2-eb6f-48a6-b9d1-434d2a54f886-ruchi.mp4',
  'videos/testimonials/a4f8cbb4-8adc-4e28-af25-410ca64a59e8-perl.mp4',
  'videos/testimonials/a6cd0d2b-30cc-491a-bf1f-252aed7ed0b6-komal-testimonial.mp4',
  'videos/testimonials/aedd4984-0b56-457b-ba52-5d46f9976a43-puneet.mp4',
  'videos/testimonials/b00c24bc-7a8f-4d7b-833e-1dd15ca2f3b2-ruby-testimonial.mp4',
  'videos/testimonials/d8c3095d-5d4b-4842-a68d-2a53ce29a966-harmeet-testimonial.mp4',
  'videos/testimonials/f412e684-95c0-4183-8fb4-61d352514ac9-madhu-testimonial.mp4',
  // 3 programs
  'videos/programs/0e93b350-77af-48a8-b289-a8eee6732a69-14-day-gut-cleanse.mp4',
  'videos/programs/5a9a1432-f8ec-4edc-9fe8-fce346d95c15-four-week-metabolic-kickstarter.mp4',
  'videos/programs/cf83339d-6531-43cd-909b-ecc12acfb20e-hormone-harmony.mp4',
];

async function verifyAll() {
  console.log(`Checking ${allVideos.length} videos in R2 for FastStart...`);
  let passed = 0;
  for (const key of allVideos) {
    const headRes = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Range: 'bytes=0-65535'
    }));
    const chunks = [];
    for await (const chunk of headRes.Body) {
      chunks.push(chunk);
    }
    const buf = Buffer.concat(chunks);
    const moovIdx = buf.indexOf('moov');
    if (moovIdx !== -1) {
      console.log(`[PASS] ${key} -> moov at byte ${moovIdx}`);
      passed++;
    } else {
      console.error(`[FAIL] ${key} -> NOT FASTSTART!`);
    }
  }
  console.log(`\nResult: ${passed}/${allVideos.length} videos have FastStart enabled.`);
}

verifyAll().catch(console.error);
