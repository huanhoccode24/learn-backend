import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { planId, price } = await req.json();

    if (!planId || !price) {
      return new NextResponse('Missing plan info', { status: 400 });
    }

    // Parse giá tiền, ví dụ: "50.000đ" -> 50000
    const amount = parseInt(price.replace(/\D/g, ''), 10);

    // Tính base URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const sessionCheckout = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `Gói Thành Viên ${planId}`,
              description: `Nâng cấp tài khoản lên gói ${planId} trên BitelleLearnHub`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${appUrl}/pricing/cancel`,
      metadata: {
        userId: session.user.id,
        plan: planId, // PRO hoặc VIP
      },
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
