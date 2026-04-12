import LegalLayout from "./LegalLayout";

const Terminos = () => (
  <LegalLayout title="Términos y Condiciones (SaaS)">
    <section>
      <h2 className="text-xl font-bold text-foreground">1. Objeto</h2>
      <p>GridXD proporciona una herramienta de automatización basada en Inteligencia Artificial para la extracción, limpieza y procesamiento de activos visuales para diseñadores y desarrolladores.</p>
    </section>

    <section className="bg-card border border-border rounded-xl p-6 my-8">
      <h2 className="text-xl font-bold text-foreground mb-4">2. Propiedad de los Resultados (Copyright)</h2>
      <ul className="list-disc pl-5 space-y-4">
        <li>
          Según el artículo 5 de la LPI en España, la autoría se atribuye a personas físicas. El usuario es el único responsable de asegurar que tiene derechos sobre la imagen original subida.
        </li>
        <li>
          El usuario ostenta la propiedad de los archivos procesados (PNG/SVG). No obstante, se informa que los resultados generados íntegramente por IA sin intervención humana significativa podrían carecer de protección por derecho de autor según la legislación vigente en 2026.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">3. Etiquetado de IA</h2>
      <p>De acuerdo con el Art. 50 del AI Act, los archivos exportados pueden contener metadatos técnicos que identifiquen el uso de IA en su procesamiento para garantizar la transparencia en el ecosistema digital.</p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">4. Limitación de Responsabilidad</h2>
      <p>El servicio se presta "tal cual". No garantizamos una precisión absoluta en la segmentación de imágenes con fondos complejos, gradientes extremos o baja resolución.</p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">5. Pagos y Cancelaciones</h2>
      <p>Las suscripciones Pro y Pro+ se facturan mensualmente. El usuario puede cancelar su suscripción en cualquier momento desde el panel de usuario, manteniendo el acceso hasta el final del periodo facturado.</p>
    </section>
  </LegalLayout>
);

export default Terminos;
