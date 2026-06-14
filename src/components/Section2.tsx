export default function Section2() {
  const params = new URLSearchParams(window.location.search);

  const firstname = params.get("firstname") || "";
  const lastname = params.get("lastname") || "";

  return (
    <div className="section section2">
      <div className="stars" />
      <div className="section2-content">
        <div className="invite-label">YOU ARE INVITED</div>

        <h2 className="invite-title">
          Entdecke die faszinierende Welt des Mikrobioms
        </h2>

        <p className="invite-body">
          Hallo {firstname} {lastname}
        </p>

        <div className="invite-divider" />

        <p className="invite-body">
          wir freuen uns unglaublich, dich auf eine immersive Reise in die Welt
          von Probiom 8 einzuladen. Unter dem Motto 'Follow the 8' erwartet dich
          ein einzigartiges Erlebnis, bei dem wir gemeinsam die spannende Welt
          des Mikrobioms entdecken.
        </p>

        <div className="invite-details">
          <div className="detail-item">
            <span className="detail-label">DATE</span>
            <span className="detail-value">1 September, 2026</span>
          </div>

          <div className="detail-sep" />

          <div className="detail-item">
            <span className="detail-label">TIME</span>
            <span className="detail-value">16:00 — 22:00</span>
          </div>

          <div className="detail-sep" />

          <div className="detail-item">
            <span className="detail-label">LOCATION</span>
            <span className="detail-value">TBA</span>
          </div>
        </div>

        <button className="invite-btn">jetzt vormerken</button>
      </div>
    </div>
  );
}
