// ATTENTION — Ces témoignages sont des PLACEHOLDERS.
// Remplace-les par de vrais avis de tes acheteurs avant de mettre en production.
// Collecte : envoie le lien mailto ci-dessous à tes premiers acheteurs.

const AVIS_PLACEHOLDER = [
  {
    initiales: 'K.D.',
    prenom:    'Kofi D.',
    ville:     'Lyon, France',
    produit:   'Pack Complet',
    texte:
      '"Enfin une ressource pensée pour nous. J\'ai compris comment ouvrir un compte depuis la France et j\'ai fait ma première simulation avec le Tracker. Les calculs fiscaux sont clairs, rien n\'est caché."',
    etoiles: 5,
  },
  {
    initiales: 'A.T.',
    prenom:    'Aminata T.',
    ville:     'Dakar, Sénégal',
    produit:   'Guide PDF — Résident UEMOA',
    texte:
      '"Je savais que la BRVM existait mais je ne savais pas comment investir concrètement. Le guide explique tout étape par étape, avec des exemples réels. J\'ai ouvert mon compte deux semaines après."',
    etoiles: 5,
  },
  {
    initiales: 'M.B.',
    prenom:    'Moussa B.',
    ville:     'Paris, France',
    produit:   'Tracker Dashboard',
    texte:
      '"Le Tracker change vraiment la donne. Je vois en temps réel combien je reçois de dividendes, ce que ça représente net d\'impôts en France. Je recommande sans hésiter."',
    etoiles: 5,
  },
]

function Etoiles({ n }) {
  return (
    <span aria-label={`${n} étoiles sur 5`} style={{ color: '#C9A84C', fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

export default function Temoignages() {
  return (
    <section className="section temoignages" id="avis" style={{ padding: '60px 0' }}>
      <style>{`
        .temoignage-card {
          background: #0F1A12;
          border: 1px solid #1E2E21;
          border-radius: 16px;
          padding: 24px 22px;
          position: relative;
          transition: border-color 0.25s;
        }
        .temoignage-card:hover { border-color: rgba(201,168,76,0.3); }
        .temoignage-card::before {
          content: '"';
          position: absolute;
          top: -14px; left: 20px;
          font-size: 72px;
          line-height: 1;
          color: rgba(201,168,76,0.18);
          font-family: Georgia, serif;
          pointer-events: none;
        }
        .temoignages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 800px) {
          .temoignages-grid { grid-template-columns: 1fr; }
        }
        .temo-produit {
          display: inline-block;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          color: #C9A84C;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 12px;
        }
        .temo-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0D3B2E, #1a5c42);
          border: 1.5px solid rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 13px; color: #C9A84C;
          font-family: 'DM Mono', monospace;
          flex-shrink: 0;
        }
        .temo-texte {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.7);
          margin-bottom: 18px;
          font-style: italic;
        }
        .temo-footer {
          display: flex; align-items: center; gap: 12px;
        }
        .temo-infos-nom {
          font-weight: 800; font-size: 14px; color: #fff;
        }
        .temo-infos-ville {
          font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px;
        }
        .cta-avis {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.4);
          color: #C9A84C;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          padding: 12px 22px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
          cursor: pointer;
        }
        .cta-avis:hover {
          background: rgba(201,168,76,0.08);
          border-color: #C9A84C;
        }
      `}</style>

      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Ce qu'ils en disent</span>
          <h2>Ceux qui ont sauté le pas</h2>
          <p>La diaspora africaine qui passe à l'action, avec des outils faits pour elle.</p>
        </div>

        <div className="temoignages-grid" style={{ marginBottom: 32 }}>
          {AVIS_PLACEHOLDER.map((a, i) => (
            <div className="temoignage-card" key={i}>
              <div className="temo-produit">{a.produit}</div>
              <p className="temo-texte">{a.texte}</p>
              <div className="temo-footer">
                <div className="temo-avatar">{a.initiales}</div>
                <div>
                  <div className="temo-infos-nom">{a.prenom}</div>
                  <div className="temo-infos-ville">{a.ville}</div>
                  <div style={{ marginTop: 4 }}>
                    <Etoiles n={a.etoiles} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collecte d'avis */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 14, lineHeight: 1.6 }}>
            Tu as déjà un produit DiaspoInvest ?<br />
            Partage ton expérience — ça aide d'autres membres de la diaspora à franchir le pas.
          </p>
          <a
            href="mailto:contact@diaspoinvest.fr?subject=Mon avis sur DiaspoInvest&body=Bonjour Jordan,%0A%0AJ'ai acheté [nom du produit] et voici mon retour :%0A%0A[Ton avis en quelques lignes]%0A%0APrénom, Ville"
            className="cta-avis"
          >
            ✉ Laisser mon avis
          </a>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>
            Par email à contact@diaspoinvest.fr · Réponse sous 24h
          </p>
        </div>
      </div>
    </section>
  )
}
