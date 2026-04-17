const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Set these in Netlify environment variables:
//   STRIPE_PRICE_ID_MONTHLY  — your Stripe recurring monthly price ID
//   STRIPE_PRICE_ID_ANNUAL   — your Stripe recurring annual price ID
//   STRIPE_PRICE_ID_LIFETIME — your Stripe one-time lifetime price ID (or use STRIPE_PRICE_ID as fallback)
const PRICE_IDS = {
  monthly:  process.env.STRIPE_PRICE_ID_MONTHLY,
  annual:   process.env.STRIPE_PRICE_ID_ANNUAL,
  lifetime: process.env.STRIPE_PRICE_ID_LIFETIME || process.env.STRIPE_PRICE_ID,
};

// Monthly and annual are subscriptions; lifetime is a one-time payment
const PLAN_MODES = {
  monthly:  "subscription",
  annual:   "subscription",
  lifetime: "payment",
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email, plan = "lifetime" } = JSON.parse(event.body || "{}");
    const siteUrl = process.env.SITE_URL || "http://localhost:8888";

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid plan selected." }),
      };
    }

    const mode = PLAN_MODES[plan] || "payment";

    const sessionConfig = {
      payment_method_types: ["card"],
      mode,
      success_url: `${siteUrl}/order.html?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${siteUrl}/checkout.html?cancelled=true&plan=${plan}`,
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    };

    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Stripe session error:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to create checkout session. Please try again.",
      }),
    };
  }
};
