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
              <div className="hbc-label">Rendement Sonatel — BRVM</div>
            </div>
          </div>

          <div className="histoire-texte">
            <span className="eyebrow">Notre histoire</span>
            <h2>La découverte</h2>

            {/* TODO Jordan : colle ici l'introduction de ton livre */}
            <p className="histoire-intro">
              [Introduction du livre à insérer ici]
            </p>

            <div className="histoire-signature">
              <strong>Jordan Djiokap</strong>
              <span>M2 Finance d'Entreprise · INSEEC Paris · Fondateur DiaspoInvest</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
