/**
 * GridXD — Web Worker for BFS Region Detection
 * Moves the CPU-intensive flood-fill algorithm OFF the main thread
 * to prevent UI freezes on large images (1-3s freeze → 0ms block).
 *
 * Usage:
 *   const worker = new Worker(new URL('./regionDetector.worker.ts', import.meta.url), { type: 'module' });
 *   worker.postMessage({ imageData, width, height });
 *   worker.onmessage = (e) => { const { regions } = e.data; };
 */

export interface RegionRaw {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface WorkerRegion extends RegionRaw {
  id: string;
}

export function detectRegionsFromImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number
): WorkerRegion[] {
  const visited = new Uint8Array(width * height);
  const rawRegions: RegionRaw[] = [];
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

      // BFS flood fill
      const queue: number[] = [idx];
      let minX = x, minY = y, maxX = x, maxY = y;
      visited[idx] = 1;
      let count = 0;
      let head = 0;

      while (head < queue.length && count < 50000) {
        const current = queue[head++];
        count++;
        const cx = current % width;
        const cy = Math.floor(current / width);

        if (cx < minX) minX = cx;
        if (cy < minY) minY = cy;
        if (cx > maxX) maxX = cx;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          current + 1,       // right
          current - 1,       // left
          current + width,   // down
          current - width,   // up
        ];

        for (const ni of neighbors) {
          if (ni < 0 || ni >= width * height) continue;
          const nx = ni % width;
          const ny = Math.floor(ni / width);

          // Prevent row-wrap on left/right neighbors
          if ((current % width === 0 && nx === width - 1) ||
              (current % width === width - 1 && nx === 0)) continue;

          if (visited[ni]) continue;
          visited[ni] = 1;

          const npi = ni * 4;
          const nb = (data[npi] + data[npi + 1] + data[npi + 2]) / 3;
          if (nb > 230 || nb < 25) continue;
          queue.push(ni);
        }
      }

      if (count > 20) {
        rawRegions.push({ minX, minY, maxX, maxY });
      }
    }
  }

  // Merge nearby regions
  let changed = true;
  const mergeDist = Math.min(width, height) * 0.04;

  while (changed) {
    changed = false;
    for (let i = 0; i < rawRegions.length; i++) {
      for (let j = i + 1; j < rawRegions.length; j++) {
        const r1 = rawRegions[i];
        const r2 = rawRegions[j];
        const isNearby =
          r1.minX < r2.maxX + mergeDist &&
          r1.maxX + mergeDist > r2.minX &&
          r1.minY < r2.maxY + mergeDist &&
          r1.maxY + mergeDist > r2.minY;

        if (isNearby) {
          rawRegions[i] = {
            minX: Math.min(r1.minX, r2.minX),
            minY: Math.min(r1.minY, r2.minY),
            maxX: Math.max(r1.maxX, r2.maxX),
            maxY: Math.max(r1.maxY, r2.maxY),
          };
          rawRegions.splice(j, 1);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  // Filter noise
  const finalRegions = rawRegions.filter(r => {
    const rw = r.maxX - r.minX;
    const rh = r.maxY - r.minY;
    return (rw > minSize * 0.5 && rh > minSize * 0.5) || rw > minSize * 1.5 || rh > minSize * 1.5;
  });

  // Grid fallback if nothing detected
  if (finalRegions.length === 0) {
    const cols = Math.ceil(Math.sqrt(Math.max(1, Math.floor(width / 100))));
    const rows = cols;
    const cellW = width / cols;
    const cellH = height / rows;
    for (let r = 0; r < rows && finalRegions.length < 9; r++) {
      for (let c = 0; c < cols && finalRegions.length < 9; c++) {
        finalRegions.push({
          minX: Math.round(c * cellW),
          minY: Math.round(r * cellH),
          maxX: Math.round((c + 1) * cellW),
          maxY: Math.round((r + 1) * cellH),
        });
      }
    }
  }

  return finalRegions.slice(0, 20).map((r, i) => ({
    id: `region-${i}-${Date.now()}`,
    ...r,
  }));
}

// Worker message handler
self.onmessage = (e: MessageEvent<{ imageData: ImageData; width: number; height: number }>) => {
  const { imageData, width, height } = e.data;
  try {
    const regions = detectRegionsFromImageData(imageData.data, width, height);
    self.postMessage({ regions, error: null });
  } catch (err) {
    self.postMessage({ regions: [], error: String(err) });
  }
};
