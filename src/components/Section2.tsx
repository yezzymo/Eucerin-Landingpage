export default function Section2() {
  const params = new URLSearchParams(window.location.search);

  const name = [params.get("firstname"), params.get("lastname")]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return (
    <div className="section section2">
      <div className="stars" aria-hidden="true" />
      <div className="section2-content">
        <div className="invite-label">YOU ARE INVITED</div>

        <h2 className="invite-title">
          Entdecke die faszinierende Welt des Mikrobioms
        </h2>

        <p className="invite-body">Hallo{name ? ` ${name}` : ""},</p>

        <div className="invite-divider" />

        <p className="invite-body">
          Wir freuen uns unglaublich, dich auf eine immersive Reise in die Welt
          von Probiom8 einzuladen. Unter dem Motto „Follow the 8" erwartet dich
          ein einzigartiges Erlebnis rund um die faszinierende Welt des
          Mikrobioms und eine revolutionäre Produktinnovation, die wir dir an
          diesem Abend exklusiv vorstellen.
        </p>

        <div className="invite-details">
          <div className="detail-item">
            <span className="detail-label">DATE</span>
            <span className="detail-value">1 September, 2026</span>
          </div>

          <div className="detail-sep" aria-hidden="true" />

          <div className="detail-item">
            <span className="detail-label">TIME</span>
            <span className="detail-value">16:00 — 22:00</span>
          </div>

          <div className="detail-sep" aria-hidden="true" />

          <div className="detail-item">
            <span className="detail-label">LOCATION</span>
            <span className="detail-value">
              Briese Studios <br /> Semperstraße 28-30,
              <br /> 22303 Hamburg-Nord
            </span>
          </div>
        </div>

        <a
          className="invite-btn"
          href="/follow-the-8.ics"
          download="Eucerin-Follow-the-8.ics"
        >
          jetzt vormerken
        </a>
      </div>
    </div>
  );
}
