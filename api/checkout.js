const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { items, success_url, cancel_url } = req.body;

    // Validatie
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid or missing items." });
    }

    const lineItems = items.map(item => ({
      price: item.priceId,
      quantity: item.quantity || 1, // fallback naar 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: success_url || "https://beesweet.framer.website/success",
      cancel_url: cancel_url || "https://beesweet.framer.website/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: "Checkout session creation failed" });
  }
};
