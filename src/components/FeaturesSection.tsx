import { Upload, Scissors, Download, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Sube tu imagen",
    description: "Arrastra cualquier imagen con iconos, sprites o elementos gráficos. JPG o PNG.",
  },
  {
    icon: Scissors,
    title: "Detección automática",
    description: "GridXD detecta cada elemento individual usando visión por computadora avanzada.",
  },
  {
    icon: Zap,
    title: "Sin fondo",
    description: "Elimina el fondo automáticamente. Cada icono queda listo con transparencia PNG.",
  },
  {
    icon: Download,
    title: "Descarga ZIP",
    description: "Todos los iconos normalizados a 512px, nombrados y empaquetados en un ZIP.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Precisión Técnica en Acción
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          Ahorra 2 horas de recorte manual por cada imagen procesada
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
