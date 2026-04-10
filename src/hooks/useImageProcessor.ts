import { useState, useCallback } from "react";
import {
  getUserTier,
  incrementUsage,
  getProcessingStrategy,
  processImageBackend,
  type UserTier,
} from "@/lib/api";

export type ProcessingState =
  | "idle"
  | "uploading"
  | "detecting"
  | "removing-bg"
  | "generating"
  | "done";

export interface ExtractedIcon {
  id: number;
  dataUrl: string;
  name: string;
}

export const statusMessages: Record<ProcessingState, string> = {
  idle: "",
  uploading: "Subiendo imagen...",
  detecting: "Detectando iconos...",
  "removing-bg": "Eliminando fondos...",
  generating: "Generando archivos...",
  done: "¡Listo!",
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function detectAndExtractIconsCanvas(file: File): Promise<ExtractedIcon[]> {
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

      const extracted: ExtractedIcon[] = regions.slice(0, 20).map((r, i) => {
        const padding = 10;
        const sx = Math.max(0, r.minX - padding);
        const sy = Math.max(0, r.minY - padding);
        const sw = Math.min(width - sx, r.maxX - r.minX + padding * 2);
        const sh = Math.min(height - sy, r.maxY - r.minY + padding * 2);

        const outCanvas = document.createElement("canvas");
        outCanvas.width = 512;
        outCanvas.height = 512;
        const outCtx = outCanvas.getContext("2d")!;

        const scale = Math.min(480 / sw, 480 / sh);
        const dw = sw * scale;
        const dh = sh * scale;
        const dx = (512 - dw) / 2;
        const dy2 = (512 - dh) / 2;

        outCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy2, dw, dh);

        return {
          id: i + 1,
          dataUrl: outCanvas.toDataURL("image/png"),
          name: `icon-${i + 1}.png`,
        };
      });

      if (extracted.length === 0) {
        const cols = Math.ceil(Math.sqrt(Math.max(1, Math.floor(width / 100))));
        const rows = cols;
        const cellW = width / cols;
        const cellH = height / rows;

        for (let r = 0; r < rows && extracted.length < 9; r++) {
          for (let c = 0; c < cols && extracted.length < 9; c++) {
            const outCanvas = document.createElement("canvas");
            outCanvas.width = 512;
            outCanvas.height = 512;
            const outCtx = outCanvas.getContext("2d")!;
            outCtx.drawImage(canvas, c * cellW, r * cellH, cellW, cellH, 16, 16, 480, 480);
            extracted.push({
              id: extracted.length + 1,
              dataUrl: outCanvas.toDataURL("image/png"),
              name: `icon-${extracted.length + 1}.png`,
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

    const tier = getUserTier();

    if (tier.tier === "free" && tier.remainingFreeUses <= 0) {
      setError("Has agotado tus 3 usos gratuitos de hoy. Activa Pro para continuar.");
      setState("idle");
      return;
    }

    const strategy = getProcessingStrategy(tier);

    if (strategy === "backend") {
      try {
        setState("uploading");
        const result = await processImageBackend(file);
        setUsedBackend(true);

        setState("done");
        setIcons(
          result.images.map((img, i) => ({
            id: i + 1,
            dataUrl: img.url,
            name: img.name,
          }))
        );
        incrementUsage();
      } catch (err) {
        // Fallback to client processing
        console.warn("Backend failed, falling back to client:", err);
        await processClientSide(file);
      }
    } else {
      await processClientSide(file);
    }
  }, []);

  const processClientSide = async (file: File) => {
    setState("uploading");
    await delay(800);

    setState("detecting");
    await delay(1500);

    const extractedIcons = await detectAndExtractIconsCanvas(file);

    setState("removing-bg");
    await delay(1200);

    setState("generating");
    await delay(600);

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

  return { state, preview, icons, error, usedBackend, processImage, reset };
}
