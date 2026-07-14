import Section1 from "./components/Section1";
import Section2 from "./components/Section2";
import ScrollVideoSection from "./components/ScrollVideoSection";
import { useFullPage } from "./hooks/useFullPage";
import "./styles/fullpage.css";

export default function App() {
  const sections = [<Section1 />, <Section2 />, <ScrollVideoSection />];
  const { current, goTo, containerRef } = useFullPage(sections.length);

  return (
    <>
      <div className="fp-container" ref={containerRef}>
        {sections.map((section, index) => (
          <div key={index}>{section}</div>
        ))}
      </div>

      <nav className="fp-nav">
        {sections.map((_, i) => (
          <button
            key={i}
            className={`fp-dot ${current === i ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </nav>
    </>
  );
}
