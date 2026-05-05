// Stripe product & price IDs for GridXD plans
export const STRIPE_PLANS = {
  pro: {
    product_id: "prod_USRjoaufxAp5xI",
    price_id: "price_1TTWpkB8N0ot3puTWg0D0fAj",
    name: "Pro",
    price: "9€/mes",
  },
  proplus: {
    product_id: "prod_USRjibmMxLKW3g",
    price_id: "price_1TTWptB8N0ot3puTRyTrQhiF",
    name: "Pro+",
    price: "19€/mes",
  },
} as const;

