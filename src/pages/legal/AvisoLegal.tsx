import LegalLayout from "./LegalLayout";

const AvisoLegal = () => (
  <LegalLayout title="Aviso Legal">
    <p>
      En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los siguientes datos identificativos:
    </p>

    <div className="bg-muted/30 rounded-lg p-6 border border-border/50 my-8">
      <ul className="space-y-2 list-none p-0 m-0">
        <li><strong>Titular:</strong> [Tu Nombre o Razón Social]</li>
        <li><strong>NIF/CIF:</strong> [Introduce tu NIF]</li>
        <li><strong>Domicilio Social:</strong> [Tu dirección física]</li>
        <li><strong>Correo electrónico:</strong> contact@gridxd.com</li>
        <li><strong>Datos Registrales:</strong> [En caso de empresa]</li>
      </ul>
    </div>

    <h2 className="text-xl font-bold text-foreground mt-8">Propiedad Intelectual</h2>
    <p>
      El diseño de la interfaz de GridXD, sus algoritmos propietarios de detección y la marca comercial son propiedad exclusiva del Titular. Se prohíbe cualquier reproducción total o parcial sin consentimiento previo.
    </p>

    <h2 className="text-xl font-bold text-foreground mt-8">Condiciones de Uso</h2>
    <p>
      El acceso a este sitio web es gratuito y su visualización no requiere previa suscripción o registro. El usuario se compromete a hacer un uso adecuado de los contenidos y servicios.
    </p>
  </LegalLayout>
);

export default AvisoLegal;
