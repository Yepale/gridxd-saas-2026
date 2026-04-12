import LegalLayout from "./LegalLayout";

const Privacidad = () => (
  <LegalLayout title="Política de Privacidad">
    <section>
      <h2 className="text-xl font-bold text-foreground">1. Responsable del Tratamiento</h2>
      <p>[Tu Nombre o Razón Social], con email contact@gridxd.com.</p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">2. Finalidad</h2>
      <p>Procesamiento de imágenes mediante IA para la extracción de activos visuales y gestión de la suscripción SaaS.</p>
    </section>

    <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8">
      <h2 className="text-xl font-bold text-primary mb-4">3. Tratamiento mediante IA (Reglamento UE 2024/1689)</h2>
      <p className="mb-4">GridXD utiliza modelos avanzados de segmentación de objetos para facilitar el flujo de trabajo de diseño.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Privacidad por Diseño:</strong> Las imágenes subidas se procesan exclusivamente para ejecutar la extracción solicitada.</li>
        <li><strong>No re-entrenamiento:</strong> Por defecto, GridXD no utiliza tus imágenes personales ni tus activos para entrenar o mejorar sus modelos globales de IA sin tu consentimiento previo y explícito (opt-in).</li>
      </ul>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">4. Legitimación</h2>
      <p>Consentimiento del interesado y ejecución de contrato (términos de servicio).</p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">5. Conservación</h2>
      <p>Las imágenes se eliminan de nuestros servidores temporales de procesamiento inmediatamente después de generar el archivo ZIP descargable, salvo que el usuario guarde el proyecto en su historial premium.</p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-foreground">6. Derechos</h2>
      <p>Puedes ejercer tus derechos de acceso, rectificación, supresión y oposición enviando un email a contact@gridxd.com.</p>
    </section>
  </LegalLayout>
);

export default Privacidad;
