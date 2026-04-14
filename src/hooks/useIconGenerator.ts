import { useState, useCallback } from "react";
import { extractStyleFromBackend, generateIconSVG, VisualStyle } from "@/lib/api";
import { applyStyleToSvg, type SvgStyle } from "@/lib/svgStyle";
import { 
  Home, User, Settings, Search, Menu, ArrowLeft, 
  Check, AlertTriangle, Bell, Trash, Plus, Download,
  Phone, Mail, Calendar, MapPin, Heart, Star,
  Eye, MessageSquare, Upload, Lock, ShoppingCart, FileText,
  type LucideIcon 
} from "lucide-react";

export type GeneratedIcon = {
  id: string;
  name: string;
  icon: LucideIcon;
  svgContent?: string;
};

const CORE_ICONS: GeneratedIcon[] = [
  { id: "home", name: "icon-home.svg", icon: Home },
  { id: "user", name: "icon-user.svg", icon: User },
  { id: "settings", name: "icon-settings.svg", icon: Settings },
  { id: "search", name: "icon-search.svg", icon: Search },
  { id: "menu", name: "icon-menu.svg", icon: Menu },
  { id: "back", name: "icon-back.svg", icon: ArrowLeft },
  { id: "check", name: "icon-check.svg", icon: Check },
  { id: "warning", name: "icon-warning.svg", icon: AlertTriangle },
  { id: "notif", name: "icon-bell.svg", icon: Bell },
  { id: "delete", name: "icon-trash.svg", icon: Trash },
  { id: "add", name: "icon-plus.svg", icon: Plus },
  { id: "download", name: "icon-download.svg", icon: Download },
  { id: "phone", name: "icon-phone.svg", icon: Phone },
  { id: "mail", name: "icon-mail.svg", icon: Mail },
  { id: "calendar", name: "icon-calendar.svg", icon: Calendar },
  { id: "pin", name: "icon-pin.svg", icon: MapPin },
  { id: "heart", name: "icon-heart.svg", icon: Heart },
  { id: "star", name: "icon-star.svg", icon: Star },
  { id: "eye", name: "icon-eye.svg", icon: Eye },
  { id: "chat", name: "icon-chat.svg", icon: MessageSquare },
  { id: "upload", name: "icon-upload.svg", icon: Upload },
  { id: "lock", name: "icon-lock.svg", icon: Lock },
  { id: "cart", name: "icon-cart.svg", icon: ShoppingCart },
  { id: "file", name: "icon-file.svg", icon: FileText },
];

export type GeneratorState = "idle" | "analyzing" | "generating" | "done" | "error";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function useIconGenerator() {
  const [state, setState] = useState<GeneratorState>("idle");
  const [visualStyle, setVisualStyle] = useState<VisualStyle | null>(null);
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<SvgStyle>("outline");

  const generateSystem = useCallback(async (referenceFile: File, variant: string = "outline") => {
    try {
      setError(null);
      setGeneratedIcons([]);
      setState("analyzing");
      
      // 1. Extract Visual DNA with Gemini
      const style = await extractStyleFromBackend(referenceFile);
      if (!style) {
        throw new Error("No se pudo analizar el estilo visual.");
      }
      
      setVisualStyle(style);
      await delay(1500); // Artificial delay for UX "magic"

      setState("generating");
      
      // 2. Real generation of the core set via AI
      const systemIcons: GeneratedIcon[] = [];
      
      // Process icons in small batches or one by one
      for (const baseIcon of CORE_ICONS) {
        try {
          const svg = await generateIconSVG(baseIcon.id, style, variant);
          systemIcons.push({
            ...baseIcon,
            svgContent: svg || undefined
          });
        } catch (err) {
          console.error(`Error generating ${baseIcon.id}:`, err);
          systemIcons.push(baseIcon); // Fallback to Lucide icon
        }
        // Small delay so the user sees them "appearing"
        setGeneratedIcons([...systemIcons]);
        await delay(400); 
      }
      
      setState("done");
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Error al generar el sistema.");
      setState("error");
    }
  }, []);

  const reset = () => {
    setState("idle");
    setVisualStyle(null);
    setGeneratedIcons([]);
    setError(null);
  };

  const downloadPack = async (projectName: string = "gridxd-system", style: SvgStyle = "outline") => {
    if (!visualStyle) return;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Style manifest with export metadata
      const manifest = {
        projectName,
        version: "1.0.0",
        exportStyle: style,
        dna: visualStyle,
        icons: CORE_ICONS.map(i => i.name)
      };

      zip.file("style-dna.json", JSON.stringify(manifest, null, 2));

      // Add styled SVG files in a named folder
      const iconsFolder = zip.folder(`icons/${style}`);
      if (iconsFolder) {
        generatedIcons.forEach(icon => {
          const svgToExport = icon.svgContent
            ? applyStyleToSvg(icon.svgContent, style, visualStyle.color_primary)
            : null;
          if (svgToExport) {
            iconsFolder.file(icon.name, svgToExport);
          }
        });
      }

      // README documenting the exported variant
      const readme = `# ${projectName} — GridXD Icon System

Generado por GridXD "The System Generator".
Variante exportada: **${style.toUpperCase()}**

## Design DNA
- Estilo Base: ${visualStyle.style}
- Variante Export: ${style}
- Color Primario: ${visualStyle.color_primary}
- Stroke: ${visualStyle.stroke_width}px
- Mood: ${visualStyle.mood}
- Grid: ${visualStyle.grid_size}×${visualStyle.grid_size}

## Estructura
\`\`\`
icons/${style}/
  icon-home.svg
  icon-user.svg
  ... (24 iconos)
style-dna.json
\`\`\`

gridxd.io — Design Intelligence`;

      zip.file("README.md", readme);

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${style}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("No se pudo generar el archivo de descarga.");
    }
  };

  return {
    state,
    visualStyle,
    generatedIcons,
    error,
    activeStyle,
    setActiveStyle,
    generateSystem,
    reset,
    downloadPack,
  };
}
