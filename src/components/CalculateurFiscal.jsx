import { useState } from 'react'

const EUR_FCFA = 655.957

const OR    = '#C9A84C'
const CARD  = '#0F1A12'
const BDR   = '#1E2E21'
const GRIS  = 'rgba(255,255,255,0.4)'
const VERT3 = '#2ECC8B'
const RED   = '#FF7676'

/* ─── Données fiscales par pays ───────────────────────────────────────────── */
const PAYS = [
  {
    code: 'FR',
    nom: 'France',
    flag: '🇫🇷',
    retenueBRVM: 0.10,
    impoLocal: 0.314,
    creditImpot: 0.10,
    assiette: 'brut',
    methode: 'cumul',
    obligations: [
      { label: 'Formulaire 3916', detail: "À remplir chaque année avec votre déclaration de revenus pour déclarer votre compte-titres étranger (SGI BRVM). Amende de 1 500 € par compte non déclaré." },
      { label: 'Formulaire 2047', detail: "Déclaration des revenus encaissés à l'étranger. Reporter les dividendes bruts (avant retenue CI) et renseigner la retenue ivoirienne (cases 8VL/8TK) pour bénéficier du crédit d'impôt." },
      { label: 'Case 2DC (2042)', detail: "Reporter le total des dividendes bruts sur votre déclaration principale. La flat tax (PFU) de 31,4% s'applique sur le brut, mais la retenue CI de 10% s'impute sur la part IR (12,8%)." },
    ],
    note: "Régime PFU (par défaut) : la retenue ivoirienne de 10% s'impute sur la part IR du PFU (12,8%) via cases 8VL/8TK, conformément à la convention CI-France (1966) et au BOFiP. Résultat : 10% déjà prélevés en CI + 21,4% restant dû en France (2,8% IR + 18,6% PS) = coût total réel ≈ 31,4%, net perçu ≈ 68,6%. · Astuce barème progressif : si ta tranche d'IR est faible (0-11%), le crédit peut annuler la quasi-totalité de l'IR français. Coût total réel ≈ 28-29% (10% CI + 18,6% PS France uniquement), net perçu ≈ 71-72%. Consulte un fiscaliste pour valider selon ta situation.",
    highlight: null,
  },
  {
    code: 'BE',
    nom: 'Belgique',
    flag: '🇧🇪',
    retenueBRVM: 0.10,
    impoLocal: 0.30,
    creditImpot: 0,
    assiette: 'net',
    methode: 'cumul',
    obligations: [
      { label: 'Déclaration revenus mobiliers', detail: "Les dividendes étrangers doivent être déclarés dans la déclaration annuelle à l'IPP (impôt des personnes physiques)." },
      { label: 'Déclaration compte étranger (CAF)', detail: "Obligation de déclarer l'existence de tout compte ouvert à l'étranger auprès de la Banque Nationale de Belgique." },
    ],
    note: 'La Belgique applique un précompte mobilier de 30% sur le montant que vous recevez après retenue source BRVM. Pas de convention fiscale CI-Belgique → double imposition sans crédit.',
    highlight: null,
  },
  {
    code: 'CH',
    nom: 'Suisse',
    flag: '🇨🇭',
    retenueBRVM: 0.10,
    impoLocal: 0.25,
    creditImpot: 0,
    assiette: 'brut',
    methode: 'cumul',
    obligations: [
      { label: 'Déclaration de revenus', detail: 'Les dividendes étrangers sont imposables en Suisse. À reporter dans votre déclaration fiscale cantonale.' },
      { label: 'Déclaration de fortune', detail: "La valeur de votre portefeuille BRVM s'intègre dans votre fortune imposable." },
    ],
    note: "Le taux de 25% est une moyenne indicative — il varie de 15% à 35% selon votre canton de résidence. Pas de convention CI-Suisse connue : la retenue source de 10% n'est pas créditée.",
    highlight: null,
  },
  {
    code: 'CA',
    nom: 'Canada',
    flag: '🇨🇦',
    retenueBRVM: 0.10,
    impoLocal: 0.25,
    creditImpot: 0.10,
    assiette: 'brut',
    methode: 'credit',
    obligations: [
      { label: 'T1 — Ligne 12100', detail: 'Déclarez vos dividendes étrangers en revenus de placements dans votre déclaration T1.' },
      { label: 'Formulaire T2209', detail: 'Foreign Tax Credit : permet de déduire la retenue à la source étrangère de votre impôt fédéral canadien.' },
    ],
    note: 'Le Foreign Tax Credit (T2209) permet de récupérer la retenue de 10% sur votre impôt canadien. Taux indicatif (fédéral + provincial moyen). Consultez un fiscaliste pour votre province.',
    highlight: null,
  },
  {
    code: 'SN',
    nom: 'Sénégal',
    flag: '🇸🇳',
    retenueBRVM: 0.10,
    impoLocal: 0,
    creditImpot: 0,
    assiette: 'brut',
    methode: 'liberatoire',
    obligations: [
      { label: 'Aucune obligation supplémentaire', detail: 'La retenue à la source est libératoire pour les résidents de la zone UEMOA.' },
    ],
    note: "En tant que résident sénégalais, l'IRVM de 10% prélevé à la source sur les dividendes BRVM est libératoire : c'est votre imposition finale. Aucune déclaration supplémentaire requise.",
    highlight: 'Imposition simple — retenue libératoire',
  },
  {
    code: 'CI',
    nom: "Côte d'Ivoire",
    flag: '🇨🇮',
    retenueBRVM: 0.10,
    impoLocal: 0,
    creditImpot: 0,
    assiette: 'brut',
    methode: 'liberatoire',
    obligations: [
      { label: 'Aucune obligation supplémentaire', detail: 'Retenue libératoire pour les résidents ivoiriens.' },
    ],
    note: 'Résidents ivoiriens : la retenue à la source de 10% est libératoire. Aucune imposition supplémentaire sur les dividendes BRVM.',
    highlight: null,
  },
  {
    code: 'BF',
    nom: 'Burkina Faso',
    flag: '🇧🇫',
    retenueBRVM: 0.125,
    impoLocal: 0,
    creditImpot: 0,
    assiette: 'brut',
    methode: 'liberatoire',
    obligations: [
      { label: 'Aucune obligation supplémentaire', detail: 'Retenue libératoire zone UEMOA.' },
    ],
    note: "Résidents burkinabè : l'IRVM de 12,5% est le taux appliqué sur les dividendes BRVM. Il est libératoire — c'est l'imposition finale.",
    highlight: null,
  },
  {
    code: 'ML',
    nom: 'Mali',
    flag: '🇲🇱',
    retenueBRVM: 0.07,
    impoLocal: 0,
    creditImpot: 0,
    assiette: 'brut',
    methode: 'liberatoire',
    obligations: [
      { label: 'Aucune obligation supplémentaire', detail: 'Retenue libératoire zone UEMOA.' },
    ],
    note: "Résidents maliens : l'IRVM de 7% (réduit de 10% à 7% en 2017) est libératoire sur les dividendes BRVM. C'est l'imposition finale.",
    highlight: null,
  },
  {
    code: 'CM',
    nom: 'Cameroun',
    flag: '🇨🇲',
    retenueBRVM: 0.10,
    impoLocal: 0.165,
    creditImpot: 0,
    assiette: 'net',
    methode: 'cumul',
    obligations: [
      { label: 'Déclaration IRPP', detail: "Les dividendes de source étrangère doivent être déclarés dans votre déclaration annuelle d'Impôt sur le Revenu des Personnes Physiques (IRPP) au Cameroun." },
      { label: 'Compte étranger', detail: "Obligation de déclarer tout compte détenu à l'étranger auprès de la Direction Générale des Impôts du Cameroun." },
    ],
    note: "Le Cameroun (zone CEMAC) n'est pas membre de l'UEMOA : vous êtes traité comme non-résident BRVM (retenue 10%). L'IRPP camerounais de 16,5% s'applique ensuite sur le montant reçu. Taux indicatif — pas de convention CI-Cameroun connue. Consultez un fiscaliste local.",
    highlight: null,
  },
]

function calcul(pays, dividendeBrut) {
  const RS = dividendeBrut * pays.retenueBRVM
  const reçu = dividendeBrut - RS
  let assiette = pays.assiette === 'brut' ? dividendeBrut : reçu
  let impoLocBrut = assiette * pays.impoLocal
  let credit = Math.min(RS, dividendeBrut * pays.creditImpot)
  let impoLocNet = Math.max(0, impoLocBrut - credit)
  let net = dividendeBrut - RS - impoLocNet
  let tauxEffectif = (dividendeBrut - net) / dividendeBrut
  return { RS, reçu, impoLocBrut, credit, impoLocNet, net, tauxEffectif }
}

const fmt = v => Math.round(v).toLocaleString('fr-FR')
const fmtEur = v => (v / EUR_FCFA).toFixed(2).replace('.', ',')
const fmtPct = v => (v * 100).toFixed(1).replace('.', ',') + ' %'

export default function CalculateurFiscal() {
  const [paysCode, setPaysCode]   = useState('FR')
  const [montant, setMontant]     = useState(100000)
  const [unite, setUnite]         = useState('FCFA')
  const [showObligation, setShowObligation] = useState(null)

  const pays = PAYS.find(p => p.code === paysCode)

  const dividendeBrut = unite === 'EUR'
    ? Math.round(montant * EUR_FCFA)
    : montant

  const { RS, reçu, impoLocBrut, credit, impoLocNet, net, tauxEffectif } = calcul(pays, dividendeBrut)

  const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16 }
  const inputStyle = {
    background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
    padding: '12px 16px', color: '#fff', fontFamily: 'Space Grotesk,sans-serif',
    fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  function Ligne({ label, montantFcfa, color, bold, prefix = '−', small }) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: small ? '8px 0' : '12px 0',
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
      }}>
        <span style={{ fontSize: small ? 12 : 13, color: color || GRIS, fontWeight: bold ? 700 : 400 }}>{label}</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: 'DM Mono,monospace', fontSize: small ? 13 : 15, fontWeight: bold ? 900 : 600,
            color: color || '#fff',
          }}>
            {prefix} {fmt(montantFcfa)} FCFA
          </span>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono,monospace' }}>
            {prefix} {fmtEur(montantFcfa)} €
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="section" id="fiscalite" style={{
      background: 'linear-gradient(160deg, #081C15 0%, #0E2A1F 50%, #06140E 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -120, right: -120, width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <style>{`
        .fiscal-pays-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }
        .pays-btn {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 12px 8px;
          cursor: pointer;
          text-align: center;
          transition: all .2s;
          color: rgba(255,255,255,0.55);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 600;
        }
        .pays-btn:hover {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.06);
          color: #fff;
          transform: translateY(-1px);
        }
        .pays-btn.active {
          border-color: ${OR};
          background: rgba(201,168,76,0.12);
          color: #fff;
          box-shadow: 0 4px 16px rgba(201,168,76,0.15);
        }
        .pays-btn .flag { font-size: 22px; display: block; margin-bottom: 5px; }
        .fiscal-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          backdrop-filter: blur(4px);
        }
        .fiscal-card-gold {
          background: rgba(201,168,76,0.07);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
        }
        .obligation-item {
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 12px;
          padding: 13px 16px;
          cursor: pointer;
          transition: all .2s;
          margin-bottom: 8px;
        }
        .obligation-item:hover { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.09); }
        .obligation-item .obli-label {
          font-size: 13px; font-weight: 700; color: ${OR};
          display: flex; justify-content: space-between; align-items: center;
        }
        .obligation-item .obli-detail {
          font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.7;
          margin-top: 8px;
        }
        .unite-toggle {
          display: flex; gap: 0; border-radius: 10px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1); width: fit-content;
        }
        .unite-btn {
          padding: 8px 18px; cursor: pointer; font-size: 13px; font-weight: 700;
          font-family: 'Space Grotesk',sans-serif; border: none; transition: all .15s;
        }
        .unite-btn.active { background: ${OR}; color: #0D2B1E; }
        .unite-btn:not(.active) { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); }
        .highlight-badge {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
          color: ${VERT3}; background: rgba(46,204,139,0.1); border: 1px solid rgba(46,204,139,0.3);
          border-radius: 20px; padding: 3px 10px; display: inline-block; margin-bottom: 8px;
        }
        .ligne-fiscale {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        @media(max-width:600px){
          .fiscal-pays-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="container" style={{ maxWidth: 540, margin: '0 auto' }}>
        <div className="section-head">
          <span className="eyebrow" style={{ color: '#E8C46A' }}>Fiscalité BRVM</span>
          <h2>Combien reste-t-il après impôts&nbsp;?</h2>
          <p style={{ color: 'rgba(255,248,231,0.6)', fontSize: 13 }}>
            Selectionne ton pays de résidence et simule l'impact fiscal sur tes dividendes BRVM.
          </p>
        </div>

        {/* Sélection pays */}
        <div className="fiscal-pays-grid">
          {PAYS.map(p => (
            <button
              key={p.code}
              className={`pays-btn${paysCode === p.code ? ' active' : ''}`}
              onClick={() => setPaysCode(p.code)}
            >
              <span className="flag">{p.flag}</span>
              {p.nom.split(' ')[0]}
            </button>
          ))}
        </div>

        {pays.highlight && (
          <div className="highlight-badge">{pays.highlight}</div>
        )}

        {/* Montant dividendes */}
        <div style={{ ...card, padding: '20px 20px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Dividendes bruts reçus
            </span>
            <div className="unite-toggle">
              <button className={`unite-btn${unite === 'FCFA' ? ' active' : ''}`} onClick={() => setUnite('FCFA')}>FCFA</button>
              <button className={`unite-btn${unite === 'EUR' ? ' active' : ''}`} onClick={() => setUnite('EUR')}>EUR</button>
            </div>
          </div>
          <input
            type="number"
            value={montant}
            min="1000"
            step={unite === 'EUR' ? 10 : 5000}
            onChange={e => setMontant(parseFloat(e.target.value) || 0)}
            style={{ ...inputStyle, fontFamily: 'DM Mono,monospace', fontSize: 24, fontWeight: 900, color: OR, padding: '14px 16px' }}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8, fontFamily: 'DM Mono,monospace' }}>
            {unite === 'FCFA'
              ? `≈ ${fmtEur(dividendeBrut)} € (1 EUR = 655,957 FCFA)`
              : `= ${fmt(dividendeBrut)} FCFA`}
          </div>
        </div>

        {/* Calcul étape par étape */}
        <div style={{ ...card, padding: '20px 20px 8px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Détail du calcul
          </div>

          <Ligne label="Dividende brut (avant tout impôt)" montantFcfa={dividendeBrut} color="rgba(255,255,255,0.7)" bold prefix="  " />
          <Ligne
            label={`Retenue à la source BRVM (${fmtPct(pays.retenueBRVM)})`}
            montantFcfa={RS}
            color={RED}
            small
          />

          {pays.impoLocal > 0 && (
            <>
              {credit > 0 && (
                <Ligne
                  label={`Impôt ${pays.nom} brut (${fmtPct(pays.impoLocal)} sur ${pays.assiette === 'brut' ? 'brut' : 'net reçu'})`}
                  montantFcfa={impoLocBrut}
                  color={RED}
                  small
                />
              )}
              {credit > 0 && (
                <Ligne
                  label="Crédit d'impôt (retenue source imputée)"
                  montantFcfa={credit}
                  color={VERT3}
                  small
                  prefix="+"
                />
              )}
              <Ligne
                label={`Impôt ${pays.nom} net${credit > 0 ? ' après crédit' : ''} (${fmtPct(pays.impoLocal)}${credit > 0 ? ' − crédit' : ''})`}
                montantFcfa={impoLocNet}
                color={RED}
              />
            </>
          )}

          {/* Résultat net */}
          <div style={{
            background: 'linear-gradient(135deg,#0D3B2E,#061A10)',
            border: `1.5px solid rgba(201,168,76,0.3)`,
            borderRadius: 12, padding: '18px 16px', marginTop: 16, marginBottom: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: GRIS, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Net dans ta poche
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                Taux effectif total : {fmtPct(tauxEffectif)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 28, fontWeight: 900, color: OR, lineHeight: 1 }}>
                {fmt(net)}
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 13, color: 'rgba(201,168,76,0.6)', marginTop: 3 }}>
                FCFA · {fmtEur(net)} €
              </div>
            </div>
          </div>
        </div>

        {/* Barre visuelle */}
        <div style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Répartition
          </div>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 28 }}>
            {pays.impoLocal > 0 && (
              <div
                style={{ width: `${(RS / dividendeBrut) * 100}%`, background: 'rgba(229,62,62,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={`Retenue BRVM : ${fmtPct(pays.retenueBRVM)}`}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{fmtPct(pays.retenueBRVM)}</span>
              </div>
            )}
            <div
              style={{ width: `${(impoLocNet / dividendeBrut) * 100}%`, background: 'rgba(229,62,62,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={`Impôt local : ${fmtPct(impoLocNet / dividendeBrut)}`}
            >
              {impoLocNet > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{fmtPct(impoLocNet / dividendeBrut)}</span>}
            </div>
            <div
              style={{ flex: 1, background: 'rgba(46,204,139,0.3)', border: '1px solid rgba(46,204,139,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: VERT3 }}>Net {fmtPct(net / dividendeBrut)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {pays.impoLocal > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(229,62,62,0.6)' }} />
                <span style={{ fontSize: 11, color: GRIS }}>Retenue BRVM</span>
              </div>
            )}
            {impoLocNet > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(229,62,62,0.4)' }} />
                <span style={{ fontSize: 11, color: GRIS }}>Impôt {pays.nom}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(46,204,139,0.3)' }} />
              <span style={{ fontSize: 11, color: GRIS }}>Net perçu</span>
            </div>
          </div>
        </div>

        {/* Note pédagogique */}
        <div className="fiscal-card-gold" style={{ padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: OR, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            À savoir — {pays.nom}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            {pays.note}
          </p>
          {/* Sources officielles France */}
          {pays.code === 'FR' && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Sources officielles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { label: 'BOFiP — Crédit d\'impôt dividendes étrangers (IR-PFU)', url: 'https://bofip.impots.gouv.fr/bofip/3399-PGP.html' },
                  { label: 'Notice 2047 — Revenus encaissés à l\'étranger', url: 'https://www.impots.gouv.fr/formulaire/2047/declaration-des-revenus-encaisses-letranger' },
                  { label: 'Formulaire 3916 — Déclaration compte étranger', url: 'https://www.impots.gouv.fr/formulaire/3916/declaration-par-un-resident-dun-compte-ouvert-letranger' },
                  { label: 'Convention fiscale CI-France (1966) — Légifrance', url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000503191' },
                ].map(s => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{
                    fontSize: 11, color: OR, opacity: 0.7,
                    textDecoration: 'underline', textUnderlineOffset: 2,
                    transition: 'opacity .15s',
                  }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.7}
                  >
                    ↗ {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Astuce barème France */}
        {pays.code === 'FR' && (
          <div style={{
            background: 'rgba(46,204,139,0.07)', border: '1px solid rgba(46,204,139,0.3)',
            borderRadius: 12, padding: '16px 18px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: VERT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Astuce — Tu paies peu d'impôts ?
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 12px' }}>
              Si tu es étudiant, salarié modeste ou que tes revenus sont faibles, tu peux <strong style={{ color: '#fff' }}>payer ~28-29% au total au lieu de 31,4%</strong> en optant pour le barème progressif sur ta déclaration.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Comparaison sur {fmt(dividendeBrut)} FCFA</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>PFU — coût total 31,4%</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{fmt(Math.round(dividendeBrut * 0.686))} FCFA net</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: VERT3 }}>Barème 0% IR — coût total ~28,6%</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 13, fontWeight: 700, color: VERT3 }}>{fmt(Math.round(dividendeBrut * 0.714))} FCFA net</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
              Sur impots.gouv.fr → cocher <strong style={{ color: 'rgba(255,255,255,0.7)' }}>"Option pour l'imposition au barème progressif"</strong> dans la section revenus de capitaux mobiliers. Valable si ta tranche marginale d'IR est 0% ou 11%.
            </p>
          </div>
        )}

        {/* Obligations déclaratives */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Obligations déclaratives
          </div>
          {pays.obligations.map((o, i) => (
            <div
              key={i}
              className="obligation-item"
              onClick={() => setShowObligation(showObligation === i ? null : i)}
            >
              <div className="obli-label">
                <span>{o.label}</span>
                <span style={{ fontSize: 16, color: OR }}>{showObligation === i ? '−' : '+'}</span>
              </div>
              {showObligation === i && (
                <div className="obli-detail">{o.detail}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Avertissement
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.7, margin: 0 }}>
            Ce simulateur est fourni à titre pédagogique et informatif uniquement. Il ne constitue pas un conseil fiscal, juridique ou financier. Les taux et règles fiscaux peuvent évoluer. Les calculs sont basés sur les dispositions connues au 1er janvier 2026 et peuvent ne pas refléter votre situation personnelle (déductions, abattements, conventions bilatérales non listées, etc.). <strong style={{ color: 'rgba(255,255,255,0.35)' }}>Consultez un expert-comptable ou un avocat fiscaliste avant toute décision.</strong> · 1 EUR = 655,957 FCFA (parité fixe Zone CFA).
          </p>
        </div>
      </div>
    </section>
  )
}
