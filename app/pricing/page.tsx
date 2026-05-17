"use client";

import { supabase } from "@/lib/supabase";

export default function PricingPage() {
  async function upgradePlan(plan: "free" | "pro" | "ultimate") {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    window.location.href = "/auth";
    return;
  }

  if (plan === "free") {
    window.location.href = "/app";
    return;
  }

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan,
      userId: data.user.id,
      email: data.user.email,
    }),
  });

  const checkoutData = await response.json();

  if (checkoutData.error) {
    alert(checkoutData.error);
    return;
  }

  window.location.href = checkoutData.url;
}

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for casual career mode players.",
      features: [
        "3 Squad IQ generations / month",
        "5 Regen Lab generations / month",
        "5 Career Ideas / month",
      ],
      button: "Continue Free",
      plan: "free" as const,
      featured: false,
    },
    {
      name: "Pro",
      price: "$3.99",
      description: "For serious managers building elite saves.",
      features: [
        "10 Squad IQ generations / month",
        "20 Regen Lab generations / month",
        "10 Career Ideas / month",
      ],
      button: "Upgrade to Pro",
      plan: "pro" as const,
      featured: true,
    },
    {
      name: "Ultimate",
      price: "$5.99",
      description: "Unlimited access to every premium tool.",
      features: [
        "Unlimited Squad IQ",
        "Unlimited Regen Lab",
        "Unlimited Career Ideas",
      ],
      button: "Upgrade to Ultimate",
      plan: "ultimate" as const,
      featured: false,
    },
  ];

  return (
    <main className="page pricing-page">
      <section className="pricing-hero card">
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
  <button
  className="landing-button secondary"
  onClick={async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      window.location.href = "/app";
    } else {
      window.location.href = "/";
    }
  }}
>
  ← Back
</button>
</div>
        <p className="kicker">Career Mode Universe</p>

        <h1>Choose your plan</h1>

        <p className="sub">
          Upgrade anytime and unlock more generations, deeper squad analysis,
          and unlimited access to premium tools.
        </p>
      </section>

      <section className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card card ${
              plan.featured ? "pricing-featured" : ""
            }`}
          >
            {plan.featured && <div className="pricing-badge">MOST POPULAR</div>}

            <div>
              <h2>{plan.name}</h2>

              <p className="pricing-description">{plan.description}</p>

              <div className="pricing-price">
                {plan.price}

                {plan.name !== "Free" && <span>/month</span>}
              </div>
            </div>

            <div className="pricing-divider" />

            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>

            <button
              className="pricing-button"
              onClick={() => upgradePlan(plan.plan)}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}