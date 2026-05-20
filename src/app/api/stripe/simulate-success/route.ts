import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new NextResponse('Missing session ID', { status: 400 });
    }

    // Xác thực trực tiếp với Stripe xem phiên này đã thanh toán chưa
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return new NextResponse('Payment not completed', { status: 400 });
    }

    const userId = checkoutSession.metadata?.userId;
    const plan = checkoutSession.metadata?.plan;

    if (!userId || !plan) {
      return new NextResponse('Missing metadata', { status: 400 });
    }

    // Cập nhật Database
    await pool.query(
      `UPDATE users SET role = $1, "updatedAt" = NOW() WHERE id = $2`,
      [plan, userId]
    );

    console.log(`[AUTO_ACTIVATE] User ${userId} upgraded to ${plan} via Session ${sessionId}`);

    return NextResponse.json({ success: true, role: plan });
  } catch (error) {
    console.error('Auto activation error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
