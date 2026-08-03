import { NextRequest, NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/order-fulfillment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId || body.session_id;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const result = await fulfillOrder(sessionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: result.purchase,
      alreadyProcessed: result.alreadyProcessed || false,
    });
  } catch (err: any) {
    console.error('Checkout verification route exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const result = await fulfillOrder(sessionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: result.purchase,
      alreadyProcessed: result.alreadyProcessed || false,
    });
  } catch (err: any) {
    console.error('Checkout verification route exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
