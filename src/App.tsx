import Section1 from "./components/Section1";
import Section2 from "./components/Section2";
import ScrollVideoSection from "./components/ScrollVideoSection";
import { useFullPage } from "./hooks/useFullPage";
import "./styles/fullpage.css";

export default function App() {
  const sections = [
    { id: "follow-the-8", label: "Follow the 8", content: <Section1 /> },
    { id: "invitation", label: "Einladung", content: <Section2 /> },
    {
      id: "mood-film",
      label: "Moodfilm",
      content: <ScrollVideoSection />,
    },
  ];
  const { current, goTo, containerRef } = useFullPage(sections.length);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>

      <main
        id="main-content"
        className="fp-container"
        ref={containerRef}
        tabIndex={-1}
      >
        {sections.map((section) => (
          <div id={section.id} key={section.id}>
            {section.content}
          </div>
        ))}
      </main>

      <nav className="fp-nav" aria-label="Seitennavigation">
        {sections.map((section, i) => (
          <button
            key={section.id}
            className={`fp-dot ${current === i ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={section.label}
            aria-controls={section.id}
            aria-current={current === i ? "true" : undefined}
          />
        ))}
      </nav>
    </>
  );
}
