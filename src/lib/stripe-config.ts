// Stripe product & price IDs for GridXD tiers
export const STRIPE_TIERS = {
  pro: {
    product_id: "prod_UAPq4WGjOqrxdg", // Starter in Stripe
    price_id: "price_1TC51BB8N0ot3puTHxyXmnBj",
    name: "Pro",
    price: "19€/mes",
  },
  proplus: {
    product_id: "prod_UAPq0CGWvYwiI5", // Pro in Stripe
    price_id: "price_1TC51CB8N0ot3puTAqa2zQjm",
    name: "Pro+",
    price: "49€/mes",
  },
} as const;
