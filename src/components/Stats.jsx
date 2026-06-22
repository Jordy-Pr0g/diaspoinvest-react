export default function Stats() {
  const items = [
    { chiffre: '47', label: 'actions BRVM analysées', sub: 'zone UEMOA · 8 pays' },
    { chiffre: '6 %', label: 'rendement dividende moyen', sub: 'vs 1,5 % Livret A' },
    { chiffre: '30 ans', label: 'de données historiques', sub: 'simulation DCA réelle' },
  ]

  return (
    <section className="stats">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
          maxWidth: 860,
          margin: '0 auto',
        }}>
          {items.map((s, i) => (
            <div key={s.label} style={{
              textAlign: 'center',
              padding: '8px 24px',
              borderRight: i < items.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.8rem, 5vw, 4rem)',
                fontWeight: 800,
                color: '#C9A84C',
                lineHeight: 1,
                marginBottom: 8,
              }}>{s.chiffre}</div>
              <div style={{ fontSize: '0.95rem', color: 'rgba(241,245,249,0.75)', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(241,245,249,0.35)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
