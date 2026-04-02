const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");
    const siteUrl = process.env.SITE_URL || "http://localhost:8888";

    const sessionConfig = {
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${siteUrl}/order.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout.html?cancelled=true`,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // Collect billing address for fraud prevention
      billing_address_collection: "auto",
      // Allow promo codes if you set them up later
      allow_promotion_codes: true,
    };

    // Pre-fill email if provided
    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Stripe session error:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to create checkout session. Please try again.",
      }),
    };
  }
};
