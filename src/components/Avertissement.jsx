import { useTranslation } from 'react-i18next'
import { DISCLAIMER } from '../data.js'

export default function Avertissement() {
  const { t, i18n } = useTranslation()
  const en = i18n.language === 'en'
  return (
    <section className="avertissement" id="avertissement">
      <div className="container">
        <div className="avert-box">
          <div>
            <h3>{en ? t('data.avertTitre') : 'Avertissement légal'}</h3>
            <p>{en ? t('data.disclaimer') : DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
