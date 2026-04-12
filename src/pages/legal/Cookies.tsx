import LegalLayout from "./LegalLayout";

const Cookies = () => (
  <LegalLayout title="Política de Cookies">
    <p>GridXD utiliza cookies para mejorar tu experiencia técnica y analítica.</p>

    <div className="space-y-8 mt-8">
      <div className="border-l-2 border-primary pl-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Cookies Técnicas (Necesarias)</h2>
        <p>Permiten la gestión de sesiones y la subida segura de archivos. No se pueden desactivar ya que son fundamentales para el funcionamiento del servicio.</p>
      </div>

      <div className="border-l-2 border-muted pl-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Cookies de Análisis (Opcionales)</h2>
        <p>Utilizamos herramientas para entender cómo interactúas con el dashboard. Solo se activan si haces clic en "Aceptar".</p>
      </div>

      <div className="border-l-2 border-muted pl-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Cookies de Personalización</h2>
        <p>Recuerdan tus preferencias de visualización, como el modo oscuro o ajustes de padding en el canvas.</p>
      </div>
    </div>

    <h2 className="text-xl font-bold text-foreground mt-12">Gestión del Consentimiento</h2>
    <p>
      Puedes revocar tu consentimiento en cualquier momento a través del panel de configuración de cookies. El bloqueo de algunas cookies puede afectar a tu experiencia de navegación.
    </p>
  </LegalLayout>
);

export default Cookies;
