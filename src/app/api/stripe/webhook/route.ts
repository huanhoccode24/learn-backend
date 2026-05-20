import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    // Verify webhook signature nếu có secret key
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown Error';
        console.error(`Webhook signature verification failed: ${errorMessage}`);
        return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
      }
    } else {
      // Nếu chưa có secret (ví dụ lúc test bằng postman), tự build lại event
      event = JSON.parse(body);
    }

    // Lắng nghe sự kiện thanh toán thành công
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        // Cập nhật Database
        await pool.query(
          `UPDATE users SET role = $1, "updatedAt" = NOW() WHERE id = $2`,
          [plan, userId]
        );
        console.log(`[STRIPE_WEBHOOK] Updated user ${userId} to role ${plan}`);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
