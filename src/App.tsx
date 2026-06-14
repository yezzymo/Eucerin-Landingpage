import Section1 from './components/Section1';
import Section2 from './components/Section2';
import Section3 from './components/Section3';
import { useFullPage } from './hooks/useFullPage';
import './styles/fullpage.css';

export default function App() {
const { current, goTo, containerRef } = useFullPage(3, 800);
  return (
    <>
      <div className="fp-container" ref={containerRef}>
        <Section1 />
        <Section2 />
        <Section3 />
      </div>

      <nav className="fp-nav">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            className={`fp-dot ${current === i ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </nav>
    </>
  );
}
