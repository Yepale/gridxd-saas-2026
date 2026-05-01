// Stripe product & price IDs for GridXD plans
export const STRIPE_PLANS = {
  pro: {
    product_id: "prod_UAPq4WGjOqrxdg",
    price_id: "price_1TC51BB8N0ot3puTHxyXmnBj",
    name: "Pro",
    price: "9€/mes",
  },
  proplus: {
    product_id: "prod_UAPq0CGWvYwiI5",
    price_id: "price_1TC51CB8N0ot3puTAqa2zQjm",
    name: "Pro+",
    price: "19€/mes",
  },
} as const;
