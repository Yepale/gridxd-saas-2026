import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:max-w-md animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-2xl relative">
        <button 
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="text-primary text-xl">🍪</span> 
          Control de Cookies
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Usamos cookies para mejorar tu flujo de trabajo. Al aceptar, nos permites analizar cómo usas GridXD. Consulta nuestra{" "}
          <Link to="/legal/cookies" className="text-primary hover:underline underline-offset-4">Política de Cookies</Link>.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="w-full border-border/50 hover:bg-muted/50 rounded-xl font-medium"
          >
            Rechazar
          </Button>
          <Button 
            onClick={handleAccept}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
