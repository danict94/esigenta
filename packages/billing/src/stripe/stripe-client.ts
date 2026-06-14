import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripeServerClient(): Stripe {
  if (stripeClient) {
    return stripeClient
  }

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY non configurata.")
  }

  stripeClient = new Stripe(secretKey)

  return stripeClient
}
