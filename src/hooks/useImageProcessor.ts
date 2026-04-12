import { useState, useCallback } from "react";
import {
  incrementUsage,
  getProcessingStrategy,
  processImageBackend,
  ProcessingOptions,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export type ProcessingState =
  | "idle"
  | "uploading"
  | "detecting"
  | "removing-bg"
  | "vectorizing"
  | "generating"
  | "done";

export interface ExtractedIcon {
  id: number;
  dataUrl: string;
  svgContent: string;
  name: string;
}

export function getIconName(
  id: number, 
  projectName: string, 
  resLabel: string, 
  date: string
): string {
  const paddedId = id.toString().padStart(2, '0');
  const proj = projectName.trim() || "Asset";
  return `GRIDXD_${proj}_${paddedId}_${resLabel}_${date}.png`;
}

export const statusMessages: Record<ProcessingState, string> = {
  idle: "",
  uploading: "Subiendo imagen...",
  detecting: "Detectando iconos...",
  "removing-bg": "Eliminando fondos...",
  vectorizing: "Vectorizando (SVG)...",
  generating: "Generando archivos...",
  done: "¡Listo!",
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function detectAndExtractIconsCanvas(
  file: File, 
  options: ProcessingOptions,
  onStateChange?: (state: ProcessingState) => void
): Promise<ExtractedIcon[]> {
  // @ts-ignore
  const ImageTracer = (await import("imagetracerjs")).default;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      const visited = new Uint8Array(width * height);
      const regions: { minX: number; minY: number; maxX: number; maxY: number }[] = [];
      const minSize = Math.min(width, height) * 0.05;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (visited[idx]) continue;

          const pi = idx * 4;
          const brightness = (data[pi] + data[pi + 1] + data[pi + 2]) / 3;
          if (brightness > 230 || brightness < 25) {
            visited[idx] = 1;
            continue;
          }

          const queue = [{ x, y }];
          let minX = x, minY = y, maxX = x, maxY = y;
          visited[idx] = 1;
          let count = 0;

          while (queue.length > 0 && count < 50000) {
            const p = queue.shift()!;
            count++;
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);

            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = p.x + dx, ny = p.y + dy;
              if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
              const ni = ny * width + nx;
              if (visited[ni]) continue;
              visited[ni] = 1;

              const npi = ni * 4;
              const nb = (data[npi] + data[npi + 1] + data[npi + 2]) / 3;
              if (nb > 230 || nb < 25) continue;
              queue.push({ x: nx, y: ny });
            }
          }

          const rw = maxX - minX;
          const rh = maxY - minY;
          if (rw > minSize && rh > minSize && count > 100) {
            const overlaps = regions.some(
              (r) => !(maxX < r.minX || minX > r.maxX || maxY < r.minY || minY > r.maxY)
            );
            if (!overlaps) {
              regions.push({ minX, minY, maxX, maxY });
            }
          }
        }
      }

      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const proj = options.projectName || "Project";

      const extracted: ExtractedIcon[] = regions.slice(0, 20).map((r, i) => {
        const padding = 15; 
        const sx = Math.max(0, r.minX - padding);
        const sy = Math.max(0, r.minY - padding);
        const sw = Math.min(width - sx, r.maxX - r.minX + padding * 2);
        const sh = Math.min(height - sy, r.maxY - r.minY + padding * 2);

        const outCanvas = document.createElement("canvas");
        const resolution = options.upscale ? 2048 : 1024;
        outCanvas.width = resolution;
        outCanvas.height = resolution;
        const outCtx = outCanvas.getContext("2d")!;

        // 🎯 BACKGROUND REMOVAL HEURISTIC (Client-Side)
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = sw;
        tempCanvas.height = sh;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        
        if (options.removeBackground) {
          const cropData = tempCtx.getImageData(0, 0, sw, sh);
          const pixels = cropData.data;
          
          // Check 4 corners to find the background color
          const corners = [
            [0, 0], [sw-1, 0], [0, sh-1], [sw-1, sh-1]
          ];
          const colorFreq: Record<string, number> = {};
          corners.forEach(([cx, cy]) => {
            const cp = (cy * sw + cx) * 4;
            const key = `${pixels[cp]},${pixels[cp+1]},${pixels[cp+2]}`;
            colorFreq[key] = (colorFreq[key] || 0) + 1;
          });
          
          let dominantColor = "255,255,255";
          let maxF = 0;
          for (const key in colorFreq) {
            if (colorFreq[key] > maxF) {
              maxF = colorFreq[key];
              dominantColor = key;
            }
          }
          
          const [bgR, bgG, bgB] = dominantColor.split(",").map(Number);
          
          // If background is very dark or very light, remove it
          const luminance = (0.299 * bgR + 0.587 * bgG + 0.114 * bgB);
          const isRemovable = luminance > 220 || luminance < 35;
          
          if (isRemovable) {
            for (let p = 0; p < pixels.length; p += 4) {
              const rVal = pixels[p], gVal = pixels[p+1], bVal = pixels[p+2];
              const diff = Math.abs(rVal - bgR) + Math.abs(gVal - bgG) + Math.abs(bVal - bgB);
              if (diff < 45) {
                pixels[p + 3] = 0; 
              }
            }
            tempCtx.putImageData(cropData, 0, 0);
          }
        }

        const scale = Math.min((resolution * 0.9) / sw, (resolution * 0.9) / sh);
        const dw = sw * scale;
        const dh = sh * scale;
        const dx = (resolution - dw) / 2;
        const dy2 = (resolution - dh) / 2;

        outCtx.drawImage(tempCanvas, 0, 0, sw, sh, dx, dy2, dw, dh);

        const id = i + 1;
        const paddedId = id.toString().padStart(2, '0');
        const resLabel = options.upscale ? "2K" : "HD";
        
        // Generate SVG string
        // We use the tempCanvas (transparent PNG) as source for vectorization
        const svgString = ImageTracer.getSVGString(
          tempCtx.getImageData(0, 0, sw, sh),
          { 
            ltres: 0.1, 
            qtres: 1, 
            pathomit: 8,
            colorsampling: 1,
            numberofcolors: 2,
            mincolorratio: 0.5
          }
        );

        return {
          id,
          dataUrl: outCanvas.toDataURL("image/png"),
          svgContent: svgString,
          name: `GRIDXD_${proj}_${paddedId}_${resLabel}_${today}.png`,
        };
      });

      if (extracted.length === 0) {
        // Fallback grid split if no regions found
        const cols = Math.ceil(Math.sqrt(Math.max(1, Math.floor(width / 100))));
        const rows = cols;
        const cellW = width / cols;
        const cellH = height / rows;

        for (let r = 0; r < rows && extracted.length < 9; r++) {
          for (let c = 0; c < cols && extracted.length < 9; c++) {
            const outCanvas = document.createElement("canvas");
            const resolution = options.upscale ? 2048 : 1024;
            outCanvas.width = resolution;
            outCanvas.height = resolution;
            const outCtx = outCanvas.getContext("2d")!;
            outCtx.drawImage(canvas, c * cellW, r * cellH, cellW, cellH, 32, 32, resolution-64, resolution-64);
            const id = extracted.length + 1;
            const paddedId = id.toString().padStart(2, '0');
            const resLabel = options.upscale ? "2K" : "HD";
            extracted.push({
              id,
              dataUrl: outCanvas.toDataURL("image/png"),
              name: `GRIDXD_${proj}_${paddedId}_${resLabel}_${today}.png`,
            });
          }
        }
      }

      resolve(extracted);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function useImageProcessor() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [icons, setIcons] = useState<ExtractedIcon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usedBackend, setUsedBackend] = useState(false);
  
  // New States for Options
  const [removeBackground, setRemoveBackground] = useState(true);
  const [upscale, setUpscale] = useState(true); // Default to true for "max resolution"
  const [projectName, setProjectName] = useState("");

  const { tier: authTier } = useAuth();

  // Dynamic renaming effect
  const updateIconNames = useCallback(() => {
    if (icons.length === 0) return;
    
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const resLabel = upscale ? "2K" : "HD";
    
    setIcons(prev => prev.map(icon => ({
      ...icon,
      name: getIconName(icon.id, projectName, resLabel, today)
    })));
  }, [projectName, upscale, icons.length]);

  // Update names when project name or resolution changes
  // Note: We use a separate effect to avoid re-running calculation on every icons change if not needed
  // but for simplicity here we just watch projectName and upscale
  const handleProjectNameChange = (val: string) => {
    setProjectName(val);
  };

  const processImage = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar 10MB");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Solo se aceptan JPG y PNG");
      return;
    }

    setError(null);
    setIcons([]);
    setUsedBackend(false);

    const url = URL.createObjectURL(file);
    setPreview(url);

    const tierInfo = { 
      tier: authTier, 
      remainingFreeUses: 3 - parseInt(localStorage.getItem("gridxd_daily_uses") || "0", 10) 
    };

    if (tierInfo.tier === "free" && tierInfo.remainingFreeUses <= 0) {
      setError("Has agotado tus 3 usos gratuitos de hoy. Activa Pro para continuar.");
      setState("idle");
      return;
    }

    const options: ProcessingOptions = {
      removeBackground,
      upscale,
      projectName: projectName || undefined,
    };

    const strategy = getProcessingStrategy(tierInfo);

    if (strategy === "backend") {
      try {
        setState("uploading");
        const result = await processImageBackend(file, options);
        setUsedBackend(true);

        setState("done");
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const proj = projectName || "Project";
        const resLabel = upscale ? "2K" : "HD";

        setIcons(
          result.images.map((img, i) => ({
            id: i + 1,
            dataUrl: img.url,
            svgContent: "", // Backend should provide this in a real integration
            name: img.name.startsWith("GRIDXD") 
              ? img.name 
              : `GRIDXD_${proj}_${(i+1).toString().padStart(2, '0')}_${resLabel}_${today}.png`,
          }))
        );
        incrementUsage();
      } catch (err) {
        console.warn("Backend failed, falling back to client:", err);
        await processClientSide(file, options);
      }
    } else {
      await processClientSide(file, options);
    }
  }, [authTier, removeBackground, upscale, projectName]);

  const processClientSide = async (file: File, options: ProcessingOptions) => {
    setState("uploading");
    await delay(600);
    setState("detecting");
    await delay(1000);
    const extractedIcons = await detectAndExtractIconsCanvas(file, options);
    
    if (options.removeBackground) {
      setState("removing-bg");
      await delay(800);
    }

    setState("vectorizing");
    await delay(600);
    
    setState("generating");
    await delay(400);
    setIcons(extractedIcons);
    setState("done");
    incrementUsage();
  };

  const reset = () => {
    setState("idle");
    setPreview(null);
    setIcons([]);
    setError(null);
    setUsedBackend(false);
  };

  return { 
    state, 
    preview, 
    icons, 
    error, 
    usedBackend, 
    processImage, 
    reset,
    options: {
      removeBackground,
      setRemoveBackground,
      upscale,
      setUpscale,
      projectName,
      setProjectName,
      updateIconNames // Export this so UI can trigger it or use it in effect
    }
  };
}

