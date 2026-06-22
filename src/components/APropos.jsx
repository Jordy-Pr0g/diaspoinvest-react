export default function APropos() {
  return (
    <section className="section apropos" id="apropos">
      <div className="container">
        <div className="apropos-inner">

          {/* Gauche — texte */}
          <div className="apropos-text">
            <span className="eyebrow">À propos</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, marginTop: 12, marginBottom: 24 }}>
              Pourquoi DiaspoInvest existe
            </h2>
            <p>
              Je m'appelle Jordan Djiokap. Étudiant en finance à Paris, j'ai voulu investir une partie de mon épargne sur la BRVM — la bourse de mes origines. J'ai cherché des ressources claires, en français, adaptées à la diaspora. Je n'en ai pas trouvé.
            </p>
            <p>
              J'ai passé des mois à éplucher les textes fiscaux, les formulaires de déclaration, les SGI qui acceptent les non-résidents. DiaspoInvest est le résultat de ce travail : une plateforme qui centralise tout ce qu'il faut pour investir sur la BRVM depuis la France, le Canada, ou n'importe quelle ville de la diaspora.
            </p>
            <p>
              Les outils sont gratuits. Les guides sont là pour ceux qui veulent aller plus loin. La mission reste la même : rendre la bourse africaine accessible à tous.
            </p>
            <a href="mailto:contact@diaspoinvest.fr" className="apropos-contact">
              Me contacter → contact@diaspoinvest.fr
            </a>
          </div>

          {/* Droite — carte chiffres */}
          <div className="apropos-card">
            <div className="apropos-stat">
              <span className="apropos-stat-num">47</span>
              <span className="apropos-stat-label">actions BRVM couvertes</span>
            </div>
            <div className="apropos-divider" />
            <div className="apropos-stat">
              <span className="apropos-stat-num">8</span>
              <span className="apropos-stat-label">pays de la zone UEMOA</span>
            </div>
            <div className="apropos-divider" />
            <div className="apropos-stat">
              <span className="apropos-stat-num">30 ans</span>
              <span className="apropos-stat-label">de données historiques simulées</span>
            </div>
            <div className="apropos-divider" />
            <div className="apropos-stat">
              <span className="apropos-stat-num">100 %</span>
              <span className="apropos-stat-label">indépendant · non affilié à la BRVM</span>
            </div>
            <div className="apropos-mission">
              <span>🎯</span>
              <p>Rendre la bourse africaine aussi accessible que l'investissement en Europe.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
