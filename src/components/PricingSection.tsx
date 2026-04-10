import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { stripeService } from "@/api/stripeService";
import { STRIPE_TIERS } from "@/lib/stripe-config";
import AuthModal from "@/components/AuthModal";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "0€",
    period: "",
    description: "Empieza gratis. Sin fricción.",
    features: [
      "3 imágenes/día",
      "PNG básico (512px)",
      "Detección por Canvas",
      "Sin registro",
    ],
    cta: "Empezar gratis",
    highlighted: false,
    tierKey: null as string | null,
  },
  {
    name: "Pro",
    price: "9€",
    period: "/mes",
    description: "Ahorra 2h de trabajo manual por imagen.",
    features: [
      "Imágenes ilimitadas",
      "PNG HD (1024px)",
      "Detección avanzada (OpenCV)",
      "Eliminación de fondo real (rembg)",
      "Export SVG",
      "Naming automático",
    ],
    cta: "Activar Pro",
    highlighted: true,
    tierKey: "pro",
  },
  {
    name: "Pro+",
    price: "19€",
    period: "/mes",
    description: "Automatiza tu flujo completo.",
    features: [
      "Todo lo de Pro",
      "Batch (varias imágenes a la vez)",
      "Historial guardado",
      "API access",
      "Soporte prioritario",
    ],
    cta: "Activar Pro+",
    highlighted: false,
    tierKey: "proplus",
  },
];

const PricingSection = () => {
  const { user, tier: currentTier } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleActivate = async (tierKey: string | null) => {
    if (!tierKey) {
      window.location.hash = "#upload";
      return;
    }

    if (!user) {
      setAuthOpen(true);
      return;
    }

    const stripeTier = STRIPE_TIERS[tierKey as keyof typeof STRIPE_TIERS];
    if (!stripeTier) return;

    setLoadingTier(tierKey);
    try {
      const url = await stripeService.createCheckoutSession(stripeTier.price_id);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al crear sesión de pago");
    } finally {
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tierKey: string | null) => {
    if (!tierKey) return currentTier === "free";
    return currentTier === tierKey;
  };

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Deja de recortar a mano
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
          Cada minuto recortando iconos es un minuto que no estás diseñando
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-card border-primary glow-cyan"
                  : "bg-card border-border hover:border-muted-foreground/30"
              } ${isCurrentPlan(plan.tierKey) ? "ring-2 ring-primary" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  POPULAR
                </div>
              )}

              {isCurrentPlan(plan.tierKey) && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                  TU PLAN
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleActivate(plan.tierKey)}
                disabled={isCurrentPlan(plan.tierKey) || (loadingTier !== null && loadingTier === plan.tierKey)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:scale-105 glow-cyan"
                    : "bg-muted text-foreground hover:bg-muted/80"
                } disabled:opacity-50 disabled:hover:scale-100`}
              >
                {(loadingTier !== null && loadingTier === plan.tierKey)
                  ? "Cargando..."
                  : isCurrentPlan(plan.tierKey)
                  ? "Plan actual"
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </section>
  );
};

export default PricingSection;
