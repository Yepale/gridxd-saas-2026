import footerLogo from "@/assets/footer-logo.png";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border py-12 px-4">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img src={footerLogo} alt="GridXD" className="w-8 h-8" />
          <span className="font-bold text-foreground">GridXD</span>
        </div>
        <p className="text-muted-foreground text-sm">
          © 2026 GridXD · Inteligencia Invisible
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Link to="/legal/aviso-legal" className="text-sm text-muted-foreground hover:text-primary transition-colors">Aviso Legal</Link>
        <Link to="/legal/privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacidad</Link>
        <Link to="/legal/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</Link>
        <Link to="/legal/terminos" className="text-sm text-muted-foreground hover:text-primary transition-colors">Términos</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
