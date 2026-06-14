import NeatBackground from "./LiquidGradientBackground.tsx";

export default function Section1() {
  return (
    <div className="section section1">
      <NeatBackground />

      <div className="section1-content">
        <h1 className="follow-text">Follow the</h1>
        <div className="eight-wrap">
          <img src="/public/8.svg" alt="8" className="eight-svg" />
        </div>
      </div>
    </div>
  );
}
