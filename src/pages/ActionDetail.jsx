import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getMeta, PAYS_LABEL } from '../data/brvm-meta.js'
import { useMeta } from '../hooks/useMeta.js'

const OR   = '#C9A84C'
const VERT = '#2ECC8B'
const RED  = '#FF7676'
const GRIS = 'rgba(255,255,255,0.45)'
const BDR  = 'rgba(255,255,255,0.09)'
const CARD = 'rgba(255,255,255,0.04)'

const fmt = v => Math.round(v).toLocaleString('fr-FR')

const LABEL_COLORS = {
  'Blue Chip':      { bg: 'rgba(201,168,76,0.15)',  border: 'rgba(201,168,76,0.4)',  color: OR },
  'Haut Dividende': { bg: 'rgba(46,204,139,0.12)',  border: 'rgba(46,204,139,0.4)',  color: VERT },
  'Stable':         { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)' },
  'Croissance':     { bg: 'rgba(99,179,237,0.12)',  border: 'rgba(99,179,237,0.4)',  color: '#63B3ED' },
}

export default function ActionDetail() {
  const { symbole } = useParams()
  const { t } = useTranslation()
  const ticker = symbole?.toUpperCase() || ''
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const meta = getMeta(ticker)
  const lc = meta.label ? LABEL_COLORS[meta.label] : null
  // Traductions des métadonnées partagées (EN via namespace meta.*, repli FR par defaultValue)
  const trSect = s => t(`meta.secteurs.${s}`, { defaultValue: s })
  const trLabel = l => t(`meta.labels.${l}`, { defaultValue: l })
  const trPays = c => t(`meta.pays.${c}`, { defaultValue: PAYS_LABEL[c] || c })

  useMeta({
    title: `${ticker} — Cours, dividende et rendement BRVM | DiaspoInvest`,
    description: `Cours en temps réel, rendement et dividende de ${ticker} sur la BRVM. Secteur ${meta.secteur}, ${PAYS_LABEL[meta.pays] || meta.pays}. Simulation DCA disponible.`,
    url: `https://diaspoinvest.fr/screener/${ticker}`,
  })

  useEffect(() => {
    fetch('/api/brvm-data')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.actions) {
          const found = d.actions.find(a => a.symbole === ticker)
          setAction(found || null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [ticker])

  const rendement = action && meta.dividende ? (meta.dividende / action.cours_cloture) * 100 : null

  const kpis = action ? [
    { label: t('pages.actionDetail.coursCloture'), val: `${fmt(action.cours_cloture)} FCFA`, color: '#F1F5F9' },
    { label: t('pages.actionDetail.variationHebdo'), val: action.variation_hebdo != null ? `${action.variation_hebdo >= 0 ? '+' : ''}${action.variation_hebdo.toFixed(2).replace('.', ',')} %` : '—', color: action.variation_hebdo > 0 ? VERT : action.variation_hebdo < 0 ? RED : GRIS },
    { label: t('pages.actionDetail.dividende'), val: meta.dividende ? `${fmt(meta.dividende)} FCFA` : t('pages.actionDetail.nonConnu'), color: meta.dividende ? VERT : GRIS },
    { label: t('pages.actionDetail.rendement'), val: rendement ? `${rendement.toFixed(2).replace('.', ',')} %` : '—', color: rendement ? OR : GRIS },
    { label: t('pages.actionDetail.secteur'), val: trSect(meta.secteur), color: '#F1F5F9' },
    { label: t('pages.actionDetail.pays'), val: trPays(meta.pays), color: '#F1F5F9' },
  ] : []

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0A1F17 0%, #0E2A1F 100%)', paddingTop: 80 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>

          <Link to="/screener" style={{ fontSize: 13, color: GRIS, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
            {t('pages.actionDetail.back')}
          </Link>

          {loading ? (
            <div style={{ color: GRIS, padding: 40 }}>{t('pages.actionDetail.chargement')}</div>
          ) : !action ? (
            <div style={{ color: GRIS, padding: 40 }}>
              {t('pages.actionDetail.introuvable', { ticker })}{' '}
              <Link to="/screener" style={{ color: OR }}>{t('pages.actionDetail.retourScreener')}</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 6 }}>
                    {trSect(meta.secteur)}
                  </span>
                  <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F1F5F9', margin: 0, lineHeight: 1.1 }}>
                    {ticker}
                  </h1>
                  <div style={{ fontSize: 15, color: GRIS, marginTop: 6 }}>{action.nom}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {lc && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: lc.bg, border: `1px solid ${lc.border}`, color: lc.color }}>
                      {trLabel(meta.label)}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: CARD, border: `1px solid ${BDR}`, color: GRIS }}>
                    {trPays(meta.pays).split(' ')[0] || meta.pays}
                  </span>
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
                {kpis.map(k => (
                  <div key={k.label} style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 20, fontWeight: 900, color: k.color }}>{k.val}</div>
                  </div>
                ))}
              </div>

              {/* Note dividende */}
              {meta.dividende && (
                <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  <Trans
                    i18nKey="pages.actionDetail.noteDiv"
                    values={{ div: fmt(meta.dividende), cours: fmt(action.cours_cloture), rendement: rendement?.toFixed(2).replace('.', ',') }}
                    components={[<b style={{ color: OR }} />, <b style={{ color: OR }} />]}
                  />
                </div>
              )}

              {/* CTA */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  to={`/backtest?ticker=${ticker}`}
                  style={{ background: OR, color: '#0D2B1E', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}
                >
                  {t('pages.actionDetail.simulerDca', { ticker })}
                </Link>
                <Link
                  to="/screener"
                  style={{ background: CARD, color: '#F1F5F9', fontWeight: 600, fontSize: 14, padding: '12px 24px', borderRadius: 12, textDecoration: 'none', display: 'inline-block', border: `1px solid ${BDR}` }}
                >
                  {t('pages.actionDetail.voirToutes')}
                </Link>
              </div>

              <div style={{ marginTop: 40, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7 }}>
                {t('pages.actionDetail.source')}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
