// Canvas will be created on first use and cached for better performance
let textMeasureCanvas: HTMLCanvasElement;

/** Uses a canvas to measure the needed width to render a string using a given
 * font definition.
 */
export function measureText(fontSize: number, text: string) {
  if (!textMeasureCanvas) {
    textMeasureCanvas = document.createElement('canvas');
  }
  const context = textMeasureCanvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create canvas context for text measurement');
  }

  const fontString = `${fontSize}px sans-serif`;

  context.font = fontString;
  return context.measureText(text);
}
