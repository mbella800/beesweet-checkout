const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true)
  res.setHeader("Access-Control-Allow-Origin", "https://beesweet.framer.website")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  const { items, success_url, cancel_url } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Geen geldige items ontvangen." })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"], // ← ENIGE wijziging!
      mode: "payment",
      line_items: items.map((item) => ({
        price: item.price, // ← Laat dit staan zoals het was
        quantity: item.quantity || 1,
      })),
      success_url,
      cancel_url,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error("Stripe fout:", err.message)
    res.status(500).json({ error: err.message })
  }
}
