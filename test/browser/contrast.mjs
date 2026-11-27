export function readContrasts(target) {
  return target.evaluateAll((elements) => {
    // Convert browser-resolved colors to sRGB, including colors from OKLCH.
    const canvas = Object.assign(document.createElement("canvas"), { width: 1, height: 1 });
    const context = canvas.getContext("2d");

    function pixel(...layers) {
      context.clearRect(0, 0, 1, 1);
      for (const layer of layers) {
        context.fillStyle = layer;
        context.fillRect(0, 0, 1, 1);
      }
      return context.getImageData(0, 0, 1, 1).data;
    }

    function luminance(pixel) {
      const [r, g, b] = Array.from(pixel).slice(0, 3).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function ratio(first, second) {
      const a = luminance(first);
      const b = luminance(second);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }

    return elements.map((element) => {
      const styles = getComputedStyle(element);
      const mark = getComputedStyle(element, "::before");
      const surfaces = [];
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        surfaces.unshift(getComputedStyle(ancestor).backgroundColor);
      }
      const surface = [styles.colorScheme.startsWith("dark") ? "black" : "white", ...surfaces];
      const background = [...surface, styles.backgroundColor];
      return {
        name: element.dataset.contrast,
        text: ratio(pixel(...background, styles.color), pixel(...background)),
        border: ratio(pixel(...background, styles.borderTopColor), pixel(...surface)),
        focus: ratio(pixel(...surface, styles.outlineColor), pixel(...surface)),
        fill: ratio(pixel(...background), pixel(...surface)),
        mark: ratio(pixel(...background, mark.backgroundColor), pixel(...background)),
        showsMark: mark.opacity === "1" && mark.maskImage !== "none",
        showsFocus: styles.outlineStyle !== "none" && parseFloat(styles.outlineWidth) > 0,
      };
    });
  });
}

export async function readContrast(target) {
  const [reading] = await readContrasts(target);
  return reading;
}
