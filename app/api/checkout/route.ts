import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.json();

  const { plan, userId, email } = body;

  const priceMap = {
    pro: "price_1TXHKiLEzXmEGBoaWneZamVQ",
    ultimate: "price_1TXHKzLEzXmEGBoasYqtNxt8",
  };

  const priceId = priceMap[plan as "pro" | "ultimate"];

  if (!priceId) {
    return NextResponse.json(
      { error: "Invalid plan selected." },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    billing_address_collection: "required",

phone_number_collection: {
  enabled: true,
},
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      plan,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}