import { useTranslation } from 'react-i18next'

export default function Probleme() {
  const { t } = useTranslation()
  const POINTS = [
    { stat: '1,5 %',   context: t('probleme.point1Context'), texte: t('probleme.point1Texte') },
    { stat: '1 500 €', context: t('probleme.point2Context'), texte: t('probleme.point2Texte') },
    { stat: '0',       context: t('probleme.point3Context'), texte: t('probleme.point3Texte') },
  ]
  return (
    <section className="section probleme" id="probleme" style={{ padding: '120px 0' }}>
      <div className="container">

        <div data-sr style={{ maxWidth: 640, marginBottom: 80 }}>
          <span className="eyebrow">{t('probleme.eyebrow')}</span>
          <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', lineHeight: 1.08, marginTop: 12, marginBottom: 0 }}>
            {t('probleme.titre')}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {POINTS.map((p, i) => (
            <div key={i} data-sr style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '48px',
              padding: '48px 0',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                  fontWeight: 800,
                  color: '#C9A84C',
                  lineHeight: 1,
                  marginBottom: 8,
                }}>{p.stat}</div>
                <div style={{ fontSize: '0.88rem', color: 'rgba(241,245,249,0.4)', lineHeight: 1.5 }}>{p.context}</div>
              </div>
              <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'rgba(241,245,249,0.7)', lineHeight: 1.75, margin: 0 }}>
                {p.texte}
              </p>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
        </div>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .probleme-row { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>
    </section>
  )
}
