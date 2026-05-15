import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && (plan === "pro" || plan === "ultimate")) {
      await supabaseAdmin.from("profiles").upsert({
  id: userId,
  email: session.customer_email,
  plan,
  stripe_customer_id: session.customer,
});
    }
  }
if (event.type === "customer.subscription.deleted") {
  const subscription = event.data.object as Stripe.Subscription;

  const customerId = subscription.customer as string;

  await supabaseAdmin
    .from("profiles")
    .update({
      plan: "free",
      stripe_customer_id: null,
    })
    .eq("stripe_customer_id", customerId);
}
if (event.type === "invoice.payment_failed") {
  const invoice = event.data.object as Stripe.Invoice;

  const customerId = invoice.customer as string;

  await supabaseAdmin
    .from("profiles")
    .update({
      plan: "free",
    })
    .eq("stripe_customer_id", customerId);
}
  return NextResponse.json({ received: true });
}