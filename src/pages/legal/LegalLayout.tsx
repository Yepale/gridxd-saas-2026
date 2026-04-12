import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => (
  <div className="min-h-screen bg-background py-16 px-4">
    <div className="max-w-3xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
      
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-foreground">
        {title}
      </h1>
      
      <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-[15px] space-y-6">
        {children}
      </div>
      
      <div className="mt-20 pt-8 border-t border-border/50 text-xs text-muted-foreground text-center">
        © 2026 GridXD · Última actualización: 10 de abril de 2026
      </div>
    </div>
  </div>
);

export default LegalLayout;
