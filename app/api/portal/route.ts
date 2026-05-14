import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { customerId } = await request.json();

  if (!customerId) {
    return NextResponse.json(
      { error: "Missing customer ID." },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app`,
  });

  return NextResponse.json({ url: session.url });
}