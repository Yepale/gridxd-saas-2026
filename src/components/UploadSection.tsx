import { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2, Download, Sparkles, Lock } from "lucide-react";
import { useImageProcessor, statusMessages } from "@/hooks/useImageProcessor";

const UploadSection = () => {
  const { state, preview, icons, error, usedBackend, processImage, reset } = useImageProcessor();
  const [dragOver, setDragOver] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDownloadZip = async () => {
    // Show upsell for free users before download
    if (!usedBackend && !showUpsell) {
      setShowUpsell(true);
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const icon of icons) {
      const base64 = icon.dataUrl.split(",")[1];
      zip.file(icon.name, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gridxd-icons.zip";
    a.click();
    URL.revokeObjectURL(url);
    setShowUpsell(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processImage(file);
    },
    [processImage]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleReset = () => {
    reset();
    setShowUpsell(false);
  };

  return (
    <section id="upload" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Pruébalo ahora
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Sube una imagen con iconos y obtén cada uno separado al instante
        </p>

        {state === "idle" && !preview ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-all duration-300 ${
              dragOver
                ? "border-primary bg-primary/5 glow-cyan"
                : "border-border hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-semibold text-lg mb-2">
              Arrastra tu imagen aquí
            </p>
            <p className="text-muted-foreground text-sm">
              JPG o PNG · Máximo 10MB
            </p>
          </div>
        ) : state !== "done" ? (
          <div className="text-center py-16">
            {preview && (
              <div className="mb-8 inline-block rounded-lg overflow-hidden border border-border max-w-xs">
                <img src={preview} alt="Preview" className="w-full h-auto" />
              </div>
            )}
            <div className="flex items-center justify-center gap-3 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg font-semibold">
                {statusMessages[state]}
              </span>
            </div>
            <div className="mt-6 w-64 mx-auto h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{
                  width:
                    state === "uploading"
                      ? "25%"
                      : state === "detecting"
                      ? "50%"
                      : state === "removing-bg"
                      ? "75%"
                      : state === "generating"
                      ? "90%"
                      : "0%",
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            {/* Upsell overlay */}
            {showUpsell && (
              <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-foreground font-bold text-lg mb-2">
                  Has generado {icons.length} iconos listos.
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Mejora la precisión y descarga en HD con detección avanzada (OpenCV) y eliminación de fondo real.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.location.hash = "#pricing"}
                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-all glow-cyan"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Activar Pro — 9€/mes
                  </button>
                  <button
                    onClick={() => {
                      setShowUpsell(false);
                      handleDownloadZip();
                    }}
                    className="px-6 py-3 rounded-lg border border-border text-muted-foreground font-semibold hover:bg-muted/30 transition-colors text-sm"
                  >
                    Descargar versión básica
                  </button>
                </div>
                <p className="text-muted-foreground text-xs mt-3">
                  Ahorra 2h de trabajo manual por cada imagen procesada
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-foreground font-semibold">
                {icons.length} iconos detectados
                {usedBackend && (
                  <span className="ml-2 text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">
                    HD
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4" /> Nueva imagen
                </button>
                <button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all glow-cyan"
                >
                  <Download className="w-4 h-4" /> Descargar ZIP
                </button>
              </div>
            </div>

            {/* PREMIUM FIGMA-STYLE PREVIEW CANVAS */}
            <div className="relative rounded-2xl border border-border/50 bg-[#F9FAFB] dark:bg-[#111111] overflow-hidden shadow-2xl mb-8">
              {/* Toolbar/Header mimicking a design tool */}
              <div className="border-b border-border/50 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ml-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Design System Preview · {icons.length} Assets
                  </span>
                </div>
              </div>

              {/* Canvas Area with Dot Grid */}
              <div 
                className="p-8 pb-12 w-full max-h-[500px] overflow-y-auto"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(150, 150, 150, 0.15) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              >
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-6 max-w-5xl mx-auto">
                  {icons.map((icon) => (
                    <div
                      key={icon.id}
                      className={`group relative flex flex-col items-center gap-3 transition-all duration-300 ${!usedBackend ? "opacity-80" : ""}`}
                    >
                      {/* Icon Base */}
                      <div 
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white dark:bg-[#0A0A0A] rounded-xl flex items-center justify-center border border-border/30 shadow-sm group-hover:shadow-md group-hover:border-primary/40 group-hover:-translate-y-1 transition-all overflow-hidden relative"
                      >
                        <img
                          src={icon.dataUrl}
                          alt={icon.name}
                          className={`w-full h-full object-contain p-4 ${
                            !usedBackend ? "blur-[4px] scale-105" : ""
                          }`}
                        />
                        {!usedBackend && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/5 backdrop-blur-[2px]">
                            <Lock className="w-5 h-5 text-primary drop-shadow-md" />
                          </div>
                        )}
                      </div>
                      
                      {/* Label below icon */}
                      <div className="w-full text-center px-1">
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground truncate transition-colors">
                          {icon.name.replace('.png', '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!usedBackend && !showUpsell && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => window.location.hash = "#pricing"}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-all glow-cyan"
                >
                  <Sparkles className="w-4 h-4" />
                  Desbloquear en HD — desde 9€/mes
                </button>
                <p className="text-muted-foreground text-xs mt-2">
                  Ahorra 2h de trabajo manual por cada imagen
                </p>
              </div>
            )}

            {usedBackend && (
              <p className="text-center text-muted-foreground text-sm mt-8">
                {icons.length} iconos en HD listos. Descárgalos en 1 clic.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-destructive text-center mt-4 font-medium">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default UploadSection;
