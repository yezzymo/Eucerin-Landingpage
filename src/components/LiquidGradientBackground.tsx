import { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

const config = {
  colors: [
    { color: "#063E42", enabled: true },
    { color: "#056367", enabled: true },
    { color: "#32AE9C", enabled: true },
    { color: "#29BADF", enabled: true },
    { color: "#f5e1e5", enabled: false },
  ],
  speed: 6,
  horizontalPressure: 4,
  verticalPressure: 4,
  waveFrequencyX: 1,
  waveFrequencyY: 1,
  waveAmplitude: 10,
  shadows: 7,
  highlights: 2,
  colorBrightness: 0.95,
  colorSaturation: 4,
  wireframe: false,
  colorBlending: 10,
  backgroundColor: "#FBFBFB",
  backgroundAlpha: 1,
  grainScale: 4,
  grainSparsity: 0,
  grainIntensity: 0.1,
  grainSpeed: 1,
  resolution: 0.05,
  yOffset: 77150,
  yOffsetWaveMultiplier: 5.9,
  yOffsetColorMultiplier: 5.8,
  yOffsetFlowMultiplier: 6.5,
  flowDistortionA: 1.1,
  flowDistortionB: 0.8,
  flowScale: 1.6,
  flowEase: 0.32,
  flowEnabled: false,
  enableProceduralTexture: false,
  textureVoidLikelihood: 0.27,
  textureVoidWidthMin: 60,
  textureVoidWidthMax: 420,
  textureBandDensity: 1.2,
  textureColorBlending: 0.06,
  textureSeed: 333,
  textureEase: 0.22,
  proceduralBackgroundColor: "#0E0707",
  textureShapeTriangles: 20,
  textureShapeCircles: 15,
  textureShapeBars: 15,
  textureShapeSquiggles: 10,
  domainWarpEnabled: false,
  domainWarpIntensity: 0,
  domainWarpScale: 3,
  vignetteIntensity: 0,
  vignetteRadius: 0.8,
  fresnelEnabled: false,
  fresnelPower: 2,
  fresnelIntensity: 0.5,
  fresnelColor: "#FFFFFF",
  iridescenceEnabled: false,
  iridescenceIntensity: 0.5,
  iridescenceSpeed: 1,
  bloomIntensity: 0,
  bloomThreshold: 0.7,
  chromaticAberration: 0,
};

export default function NeatBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const contextOptions: WebGLContextAttributes = {
      alpha: true,
      preserveDrawingBuffer: true,
      antialias: true,
    };
    const supportsWebGL =
      canvas.getContext("webgl2", contextOptions) ??
      canvas.getContext("webgl", contextOptions);

    if (!supportsWebGL) return;

    let gradient: NeatGradient | undefined;

    try {
      gradient = new NeatGradient({
        ref: canvas,
        ...config,
      });
    } catch {
      // The canvas keeps its CSS background when WebGL is unavailable or
      // disabled, so the rest of the landing page remains fully usable.
    }

    return () => {
      gradient?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="liquid-gradient-canvas"
      aria-hidden="true"
    />
  );
}
