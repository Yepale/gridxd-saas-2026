import footerLogo from "@/assets/footer-logo.png";

const Footer = () => (
  <footer className="border-t border-border py-12 px-4">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img src={footerLogo} alt="GridXD" className="w-8 h-8" />
        <span className="font-bold text-foreground">GridXD</span>
      </div>
      <p className="text-muted-foreground text-sm">
        © 2026 GridXD · Inteligencia Invisible
      </p>
    </div>
  </footer>
);

export default Footer;
