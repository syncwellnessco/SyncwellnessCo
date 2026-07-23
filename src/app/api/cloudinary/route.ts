import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { public_id, resource_type = 'image' } = await request.json();
    
    if (!public_id) {
      return NextResponse.json({ error: 'Missing public_id' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // We gracefully return success if credentials aren't set so the app doesn't crash, 
      // but the file won't actually be deleted.
      console.warn("Cloudinary API credentials missing. Cannot delete file:", public_id);
      return NextResponse.json({ success: false, reason: "Missing API credentials in .env" });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureString = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    // resource_type can be 'image' or 'video'
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/destroy`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, result }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
