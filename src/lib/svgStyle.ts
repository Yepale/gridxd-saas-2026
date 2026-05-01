/**
 * SVG Style Transformer — GridXD Pack Styles Engine
 *
 * Applies a visual style (outline, filled, duotone) to any SVG string.
 * Pure client-side — no backend required.
 *
 * Plan access:
 *  FREE     → outline only
 *  PRO      → outline | filled | duotone (single variant export)
 *  PRO+     → all 3 variants (future: multi-folder ZIP)
 */

export type SvgStyle = "outline" | "filled" | "duotone";

/**
 * Apply a visual style to a raw SVG string.
 * @param svgString  The original SVG markup
 * @param style      Target style variant
 * @param color      Primary brand color (hex or CSS color)
 * @returns          Transformed SVG string
 */
export function applyStyleToSvg(
  svgString: string,
  style: SvgStyle,
  color: string = "currentColor"
): string {
  if (!svgString) return svgString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return svgString;

  // Normalize: remove inline styles that conflict
  svg.querySelectorAll("[fill],[stroke],[style]").forEach((el) => {
    el.removeAttribute("style");
  });

  switch (style) {
    case "outline": {
      // Clean outline: no fill, stroke with primary color
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", color);
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      // Override path fill elements
      svg.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline").forEach((el) => {
        el.setAttribute("fill", "none");
        el.setAttribute("stroke", color);
        el.setAttribute("stroke-width", "2");
      });
      break;
    }

    case "filled": {
      // Solid fill: primary color, no stroke
      svg.setAttribute("fill", color);
      svg.setAttribute("stroke", "none");
      svg.querySelectorAll("path, circle, rect, polygon, ellipse").forEach((el) => {
        el.setAttribute("fill", color);
        el.setAttribute("stroke", "none");
      });
      // Lines get a stroke instead
      svg.querySelectorAll("line, polyline").forEach((el) => {
        el.setAttribute("stroke", color);
        el.setAttribute("stroke-width", "2");
        el.setAttribute("fill", "none");
      });
      break;
    }

    case "duotone": {
      // Duotone: background shape at 25% opacity + foreground stroke
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", color);
      svg.setAttribute("stroke-width", "1.5");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");

      const paths = svg.querySelectorAll("path, circle, rect, polygon, ellipse");
      paths.forEach((el, idx) => {
        if (idx % 2 === 0) {
          // Even elements: duotone background layer
          el.setAttribute("fill", color);
          el.setAttribute("fill-opacity", "0.2");
          el.setAttribute("stroke", "none");
        } else {
          // Odd elements: foreground stroke
          el.setAttribute("fill", "none");
          el.setAttribute("stroke", color);
          el.setAttribute("stroke-width", "1.5");
        }
      });

      // If only one shape, treat it as duotone (fill + stroke)
      if (paths.length === 1) {
        paths[0].setAttribute("fill", color);
        paths[0].setAttribute("fill-opacity", "0.2");
        paths[0].setAttribute("stroke", color);
        paths[0].setAttribute("stroke-width", "1.5");
      }
      break;
    }
  }

  return new XMLSerializer().serializeToString(svg);
}

/**
 * Check if a plan can access a given style variant.
 * FREE  → outline only
 * PRO   → all styles
 * PRO+  → all styles + multi-export
 */
export function canAccessStyle(
  plan: "free" | "pro" | "proplus",
  style: SvgStyle
): boolean {
  if (plan === "pro" || plan === "proplus") return true;
  return style === "outline"; // free: outline only
}

/** Style metadata for UI rendering */
export const STYLE_META: Record<SvgStyle, { label: string; description: string; icon: string }> = {
  outline: {
    label: "Outline",
    description: "Contorno limpio, 2px stroke",
    icon: "○",
  },
  filled: {
    label: "Filled",
    description: "Relleno sólido, sin trazo",
    icon: "●",
  },
  duotone: {
    label: "Duotone",
    description: "Relleno 20% + stroke",
    icon: "◑",
  },
};
