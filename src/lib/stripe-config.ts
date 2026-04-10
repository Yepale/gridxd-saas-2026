// Stripe product & price IDs for GridXD tiers
export const STRIPE_TIERS = {
  pro: {
    product_id: "prod_UJ5Nr6xHc88Rm5",
    price_id: "price_1TKTD81tQvgEHrmqYZfW7O2f",
    name: "Pro",
    price: "9€/mes",
  },
  proplus: {
    product_id: "prod_UJ5OWqjvs10ZpX",
    price_id: "price_1TKTDQ1tQvgEHrmqgu9VFkbQ",
    name: "Pro+",
    price: "19€/mes",
  },
} as const;
