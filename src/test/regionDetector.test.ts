import { describe, it, expect } from "vitest";
import { detectRegionsFromImageData } from "../workers/regionDetector.worker";

describe("Region Detector", () => {
  it("should detect a simple square region in an image", () => {
    const width = 10;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4);
    
    // Fill with white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    // Draw a black square from (2,2) to (5,5)
    for (let y = 2; y <= 5; y++) {
      for (let x = 2; x <= 5; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      }
    }

    // Since the minSize constraint and count checks in regionDetector are:
    // const minSize = Math.min(width, height) * 0.05; -> 0.5
    // if (count > 20)
    // For a 4x4 black square, the count will be 16. It will be ignored if count <= 20.
    // So let's make a bigger black square: 6x6 -> 36 count
    for (let y = 2; y <= 7; y++) {
      for (let x = 2; x <= 7; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      }
    }

    const regions = detectRegionsFromImageData(data, width, height);
    
    expect(regions).toHaveLength(1);
    expect(regions[0].minX).toBe(2);
    expect(regions[0].maxX).toBe(7);
    expect(regions[0].minY).toBe(2);
    expect(regions[0].maxY).toBe(7);
    expect(regions[0].id).toBeDefined();
  });
});
