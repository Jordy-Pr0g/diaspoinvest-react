import { Link } from 'react-router-dom'

export default function Histoire() {
  return (
    <section className="section histoire" id="histoire">
      <div className="container">
        <div className="histoire-inner">

          <div className="histoire-visuel">
            <div className="histoire-avatar">
              <div className="ha-initiales">JD</div>
            </div>
            <div className="histoire-badge-card">
              <div className="hbc-chiffre">6,11 %</div>
              <div className="hbc-label">Rendement Sonatel &mdash; BRVM</div>
            </div>
          </div>

          <div className="histoire-texte">
            <span className="eyebrow">À propos</span>
            <h2>La d&eacute;couverte</h2>

            <p className="histoire-intro">
              &Eacute;tudiant en Finance d&apos;Entreprise et Ing&eacute;nierie Financi&egrave;re,
              j&apos;&eacute;tudie au quotidien les mod&egrave;les d&apos;investissement europ&eacute;ens :
              valorisation d&apos;actifs, gestion de portefeuille, ETF, produits d&eacute;riv&eacute;s.
            </p>
            <p className="histoire-intro">
              Quand j&apos;ai voulu diversifier mon portefeuille, j&apos;ai cherch&eacute;. ETF, PEA, MSCI World,
              indices europ&eacute;ens&hellip; tout pointait vers les m&ecirc;mes march&eacute;s occidentaux.
              Alors j&apos;ai pos&eacute; une question simple&nbsp;: est-ce qu&apos;il existe quelque chose li&eacute; &agrave; l&apos;Afrique&nbsp;?
            </p>
            <p className="histoire-intro">
              La bourse ouest-africaine existe depuis 1998. Elle regroupe les principales entreprises
              de huit pays de la zone UEMOA et verse des dividendes chaque ann&eacute;e. Pourtant, presque
              personne n&apos;en parle, m&ecirc;me au sein de la diaspora.
            </p>

            <div className="histoire-stats-inline">
              <div>
                <strong>+28,89&nbsp;%</strong>
                <span>BRVM Composite 2024</span>
              </div>
              <div className="hsi-vs">vs</div>
              <div>
                <strong>+0,92&nbsp;%</strong>
                <span>CAC&nbsp;40 2024</span>
              </div>
            </div>

            <p className="histoire-intro">
              Avec ma formation, j&apos;avais les outils pour analyser ce march&eacute;. Les ressources
              en fran&ccedil;ais pens&eacute;es pour la diaspora n&apos;existaient pas. J&apos;ai cr&eacute;&eacute; DiaspoInvest
              pour les construire.
            </p>

            <div className="histoire-signature">
              <strong>Jordan DJIOKAP</strong>
              <span>Finance d&apos;Entreprise &amp; Ing&eacute;nierie Financi&egrave;re &middot; DiaspoInvest</span>
            </div>

            <Link to="/a-propos" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 24, fontSize: 14, fontWeight: 700,
              color: '#C9A84C', textDecoration: 'none',
            }}>
              En savoir plus &rarr;
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
