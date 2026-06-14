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
    if (!canvasRef.current) return;

    const gradient = new NeatGradient({
      ref: canvasRef.current,
      ...config,
    });

    return () => {
      gradient.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
