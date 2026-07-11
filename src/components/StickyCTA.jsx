import { useTranslation } from 'react-i18next'
import { LIENS } from '../data.js'

// Barre fixe affichée en bas — mobile uniquement (cf. App.css @media max-width: 860px).
export default function StickyCTA() {
  const { t } = useTranslation()
  return (
    <div className="sticky-cta">
      <div className="sc-price">
        39,99 €<small>{t('stickyCta.sub')}</small>
      </div>
      <a className="btn btn-or" href={LIENS.pack} target="_blank" rel="noreferrer">
        {t('stickyCta.cta')}
      </a>
    </div>
  )
}
