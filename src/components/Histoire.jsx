import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Histoire() {
  const { t } = useTranslation()
  return (
    <section className="section histoire" id="histoire">
      <div className="container">
        <div className="histoire-inner">

          <div className="histoire-visuel" data-sr>
            <div className="histoire-avatar">
              <div className="ha-initiales">JD</div>
            </div>
            <div className="histoire-badge-card">
              <div className="hbc-chiffre">6,11 %</div>
              <div className="hbc-label">{t('histoire.rendementLabel')}</div>
            </div>
          </div>

          <div className="histoire-texte" data-sr>
            <span className="eyebrow">{t('histoire.eyebrow')}</span>
            <h2>{t('histoire.titre')}</h2>

            <p className="histoire-intro">{t('histoire.p1')}</p>
            <p className="histoire-intro">{t('histoire.p2')}</p>
            <p className="histoire-intro">{t('histoire.p3')}</p>

            <div className="histoire-stats-inline">
              <div>
                <strong>+28,89&nbsp;%</strong>
                <span>BRVM Composite 2024</span>
              </div>
              <div className="hsi-vs">{t('histoire.statVs')}</div>
              <div>
                <strong>+0,92&nbsp;%</strong>
                <span>CAC&nbsp;40 2024</span>
              </div>
            </div>

            <p className="histoire-intro">{t('histoire.p4')}</p>

            <div className="histoire-signature">
              <strong>Jordan DJIOKAP</strong>
              <span>{t('histoire.signatureRole')}</span>
            </div>

            <Link to="/a-propos" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 24, fontSize: 14, fontWeight: 700,
              color: '#C9A84C', textDecoration: 'none',
            }}>
              {t('histoire.enSavoirPlus')}
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
