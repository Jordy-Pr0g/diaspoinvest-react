export default function Calculateur() {
  return (
    <section className="section calculateur" id="calculateur" style={{ padding: '80px 0' }}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow" style={{ color: '#E8C46A' }}>Simulateur DCA</span>
          <h2>Combien pourrait te rapporter ton épargne ?</h2>
          <p>Clique sur la case que tu veux calculer — simulation mathématique illustrative.</p>
        </div>

        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,248,231,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          <iframe
            src="/calculateur.html"
            title="Simulateur DCA BRVM"
            style={{
              width: '100%',
              height: 820,
              border: 'none',
              display: 'block',
              background: '#060E09',
            }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
