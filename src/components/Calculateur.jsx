import { useEffect, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'

/* ── Données dividendes (FCFA/action, dernier exercice fiscal) ── */
const DIVIDENDES = {
  SNTS:  { div:1740, nom:'Sonatel' },
  ORAC:  { div:720,  nom:'Orange CI' },
  SGBC:  { div:2062, nom:'SGBCI' },
  BOAB:  { div:526,  nom:'BOA Benin' },
  CBIBF: { div:900,  nom:'Coris Bank BF' },
  PALC:  { div:502,  nom:'PALMCI' },
  SLBC:  { div:2000, nom:'Solibra CI' },
  STBC:  { div:4800, nom:'SITAB CI' },
  BICC:  { div:1500, nom:'BICI CI' },
  ECOC:  { div:600,  nom:'Ecobank CI' },
  NTLC:  { div:700,  nom:'Nestle CI' },
  TTLC:  { div:200,  nom:'TotalEnergies CI' },
  TTLS:  { div:180,  nom:'TotalEnergies SN' },
  BOABF: { div:200,  nom:'BOA Burkina' },
  BOAC:  { div:340,  nom:'BOA CI' },
  BOAM:  { div:200,  nom:'BOA Mali' },
  BOAN:  { div:300,  nom:'BOA Niger' },
  BOAS:  { div:250,  nom:'BOA Senegal' },
  NSBC:  { div:550,  nom:'NSIA Banque CI' },
  SPHC:  { div:500,  nom:'SAPH CI' },
  SIBC:  { div:400,  nom:'SIB CI' },
  ONTBF: { div:150,  nom:'ONATEL BF' },
  CIEC:  { div:200,  nom:'CIE CI' },
  SDCC:  { div:400,  nom:'SODE CI' },
  ORGT:  { div:120,  nom:'Oragroup TG' },
  BICB:  { div:300,  nom:'BICIB Benin' },
  CABC:  { div:200,  nom:'SICABLE CI' },
}

const OR    = '#C9A84C'
const VERT  = '#0D3B2E'
const VERT3 = '#2ECC8B'
const BG    = '#06140E'
const CARD  = '#0F1A12'
const BDR   = '#1E2E21'
const GRIS  = 'rgba(255,255,255,0.4)'

const fmtFull = v => Math.round(v).toLocaleString('fr-FR')
const fmtShort = v => {
  if (v >= 1000000) return (v/1000000).toFixed(2).replace('.',',') + ' M'
  if (v >= 1000)    return Math.round(v/1000) + ' K'
  return Math.round(v).toLocaleString('fr-FR')
}

function shortNom(nom) {
  return nom.replace(/COTE D.IVOIRE/gi,'CI').replace(/BURKINA FASO/gi,'BF').slice(0,28)
}

function simForward(apport, duree, tauxPct, cours) {
  const divBrut = cours * tauxPct / 100
  const frais   = 0.005
  let actions=0, reste=0, divCumul=0, fraisCumul=0
  for (let m=1; m<=duree*12; m++) {
    const verse = apport*(1-frais)
    fraisCumul += apport*frais
    const dispo = reste + verse
    const n = Math.floor(dispo/cours)
    reste = dispo - n*cours
    actions += n
    divCumul += actions*divBrut/12
  }
  return { actions, portef:actions*cours, capital:apport*duree*12, divAnn:actions*divBrut, divCumul, reste, fraisCumul }
}

function simInverse_apport(divCible, duree, tauxPct, cours) {
  const divBrut = cours * tauxPct / 100
  if (divBrut <= 0) return 0
  const actionsNeeded = Math.ceil(divCible / divBrut)
  let lo=1000, hi=1000000
  for (let i=0;i<40;i++) {
    const mid=(lo+hi)/2
    if (simForward(mid,duree,tauxPct,cours).actions >= actionsNeeded) hi=mid; else lo=mid
  }
  return Math.ceil((lo+hi)/2/1000)*1000
}

function simInverse_duree(divCible, apport, tauxPct, cours) {
  for (let d=1;d<=50;d++) if (simForward(apport,d,tauxPct,cours).divAnn >= divCible) return d
  return 50
}

function livretA(apport, duree) {
  let cap=0, int=0
  for (let m=0;m<duree*12;m++) { cap+=apport; int+=cap*0.015/12 }
  return int
}

export default function Calculateur() {
  const { t, i18n } = useTranslation()
  const [titres,      setTitres]      = useState([])
  const [dateData,    setDateData]    = useState('')
  const [loadState,   setLoadState]   = useState('loading')
  const [search,      setSearch]      = useState('')
  const [selTitre,    setSelTitre]    = useState(null) // {symbole,nom,cours,dividende,taux}
  const [cours,       setCours]       = useState(28400)
  const [taux,        setTaux]        = useState(6.13)
  const [locked,      setLocked]      = useState('divann')
  const [vals,        setVals]        = useState({ apport:30000, duree:10, divann:219356 })

  /* ── Fetch données BRVM (cours + dividendes en direct) ── */
  useEffect(() => {
    Promise.all([
      fetch('/api/brvm-data').then(r => r.ok ? r.json() : null),
      fetch('/api/brvm-data?dataset=dividendes').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([data, divData]) => {
        if (!data?.actions) { setLoadState('error'); return }
        if (data.genere_le) {
          const d = new Date(data.genere_le)
          const loc = i18n.language === 'en' ? 'en-GB' : 'fr-FR'
          setDateData(d.toLocaleDateString(loc, {day:'numeric',month:'long',year:'numeric'}))
        }
        // Dividendes en direct si disponibles, sinon repli sur le tableau codé en dur
        const divMap = {}
        if (divData?.societes?.length) {
          divData.societes.forEach(s => { divMap[s.symbole] = s.montant_retenu })
        } else {
          Object.entries(DIVIDENDES).forEach(([s, v]) => { divMap[s] = v.div })
        }
        const avecDiv=[], sansDiv=[]
        data.actions.forEach(a => {
          const s=a.symbole, c=a.cours_cloture
          if (!c || c<=0) return
          if (divMap[s] != null) {
            const div=divMap[s]
            avecDiv.push({symbole:s,nom:a.nom,cours:c,dividende:div,taux:(div/c)*100,hasDividende:true})
          } else {
            sansDiv.push({symbole:s,nom:a.nom,cours:c,dividende:null,taux:null,hasDividende:false})
          }
        })
        avecDiv.sort((a,b)=>b.taux-a.taux)
        sansDiv.sort((a,b)=>a.symbole.localeCompare(b.symbole))
        const all=[...avecDiv,...sansDiv]
        setTitres(all)
        const snts=all.find(t=>t.symbole==='SNTS')
        if (snts) { setSelTitre(snts); setCours(snts.cours); setTaux(snts.taux) }
        else if (all[0]) { setSelTitre(all[0]); setCours(all[0].cours); if(all[0].taux) setTaux(all[0].taux) }
        setLoadState('ok')
      })
      .catch(() => setLoadState('error'))
  }, [])

  /* ── Filtrage recherche ── */
  const filtered = titres.filter(t => {
    if (!search.trim()) return true
    const q=search.toLowerCase()
    return t.symbole.toLowerCase().includes(q) || t.nom.toLowerCase().includes(q)
  })

  /* ── Calcul ── */
  const { result, resLabel, resUnit, resContext, resVal, kpis, livret } = (() => {
    if (!cours || cours<=0) return {}
    const a=vals.apport, d=vals.duree, dv=vals.divann
    const nom = selTitre?.symbole || t('calc.custom')
    let r, label, unit, context, mainVal, apDisplay=a, dDisplay=d, dvDisplay=dv

    if (locked==='divann') {
      r=simForward(a,d,taux,cours)
      mainVal=r.divAnn; label=t('calc.labelDivann'); unit=t('calc.unitDivann')
      context=t('calc.contextDivann', { apport:fmtFull(a), duree:d, nom, taux:taux.toFixed(2) })
      dvDisplay=r.divAnn
    } else if (locked==='apport') {
      const ap=simInverse_apport(dv,d,taux,cours)
      r=simForward(ap,d,taux,cours)
      mainVal=ap; label=t('calc.labelApport'); unit=t('calc.unitApport')
      context=t('calc.contextApport', { div:fmtFull(dv), duree:d, nom })
      apDisplay=ap
    } else {
      const dr=simInverse_duree(dv,a,taux,cours)
      r=simForward(a,dr,taux,cours)
      mainVal=dr; label=t('calc.labelDuree'); unit=dr>1?t('calc.unitDureePlural'):t('calc.unitDureeSingular')
      context=t('calc.contextDuree', { apport:fmtFull(a), nom, div:fmtFull(dv) })
      dDisplay=dr
    }
    return {
      result:r, resLabel:label, resUnit:unit, resContext:context, resVal:mainVal,
      kpis:{ actions:r?.actions||0, portef:r?.portef||0, capital:r?.capital||0, divCumul:r?.divCumul||0,
             reste:r?.reste||0, fraisCumul:r?.fraisCumul||0 },
      livret: livretA(apDisplay, dDisplay),
    }
  })()

  function onTitreChange(t) {
    setSelTitre(t); setSearch('')
    if (t) { setCours(t.cours); if(t.taux) setTaux(t.taux) }
  }

  function onCoursChange(v) {
    const c=parseFloat(v)||1; setCours(c)
    if (selTitre?.dividende) setTaux((selTitre.dividende/c)*100)
  }

  function setLock(key) { setLocked(key) }

  function updateVal(key, v) { setVals(prev=>({...prev,[key]:parseFloat(v)})) }

  const SLIDERS = {
    apport: { min:5000,  max:500000, step:5000, label:t('calc.sliderApport'), unit:t('calc.unitFcfa') },
    duree:  { min:1,     max:30,     step:1,    label:t('calc.sliderDuree'),  unit:t('calc.unitAns')  },
    divann: { min:10000, max:2000000,step:5000, label:t('calc.sliderDivann'), unit:t('calc.unitFcfaAn') },
  }

  /* ── Styles ── */
  const card  = { background:CARD, border:`1px solid ${BDR}`, borderRadius:14 }
  const input = { width:'100%', background:CARD, border:`1px solid ${BDR}`, borderRadius:12,
                  padding:'12px 16px', color:'#fff', fontFamily:'Space Grotesk,sans-serif',
                  fontSize:14, outline:'none', boxSizing:'border-box' }

  return (
    <section className="section calculateur" id="calculateur">
      <style>{`
        .calc-trio { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:20px; }
        .trio-card { background:${CARD}; border:1.5px solid ${BDR}; border-radius:14px; padding:14px 10px;
          text-align:center; cursor:pointer; transition:all .25s; position:relative; user-select:none; }
        .trio-card.locked { border-color:${OR}; background:rgba(201,168,76,0.08); }
        .trio-card.locked::before { content:'▶'; position:absolute; top:-10px; left:50%;
          transform:translateX(-50%); font-size:13px; color:${OR}; }
        .trio-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:${GRIS}; margin-bottom:6px; font-weight:600; }
        .trio-val { font-family:'DM Mono',monospace; font-size:18px; font-weight:900; color:#fff; line-height:1; }
        .trio-card.locked .trio-val, .trio-card.locked .trio-lbl { color:${OR}; }
        .trio-unit { font-size:9px; color:${GRIS}; margin-top:4px; font-family:'DM Mono',monospace; }
        .cmp-grid { display:flex; gap:10px; margin-bottom:20px; }
        .cmp { flex:1; border-radius:14px; padding:16px 12px; text-align:center; }
        .cmp.bad  { background:rgba(229,62,62,0.08); border:1px solid rgba(229,62,62,0.25); }
        .cmp.good { background:rgba(46,204,139,0.08); border:1px solid rgba(46,204,139,0.4); }
        .kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
        .kpi-card { background:${CARD}; border:1px solid ${BDR}; border-radius:14px; padding:14px; text-align:center; }
        @media(max-width:600px){.calc-trio{grid-template-columns:1fr 1fr;}.cmp-grid{flex-direction:column;}}
      `}</style>

      <div className="container" style={{ maxWidth:520, margin:'0 auto' }}>
        <div className="section-head">
          <span className="eyebrow" style={{ color:'#E8C46A' }}>{t('calc.eyebrow')}</span>
          <h2>{t('calc.titre')}</h2>
          <p style={{ color:'rgba(255,248,231,0.7)', fontSize:14, lineHeight:1.6 }}>
            {t('calc.intro')}
            {dateData && <span style={{ display:'block', color:'rgba(255,255,255,0.35)', marginTop:6, fontSize:12 }}>{t('calc.coursUpdated', { date: dateData })}</span>}
          </p>
        </div>

        <div style={{ ...card, padding:'14px 18px', marginBottom:16, borderColor:'rgba(201,168,76,0.25)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:OR, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
            {t('calc.step1Title')}
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
            {t('calc.step1Desc')}
          </div>
        </div>

        {/* Sélection titre */}
        <div style={{ marginBottom:16, position:'relative' }}>
          <input
            type="text" placeholder={t('calc.searchPlaceholder')}
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ ...input, borderRadius:'12px 12px 0 0', borderBottom:`1px solid rgba(255,255,255,0.04)` }}
          />
          {loadState==='loading' && (
            <div style={{ ...card, padding:'12px 16px', borderRadius:'0 0 12px 12px', color:GRIS, fontSize:13 }}>
              {t('calc.loading')}
            </div>
          )}
          {loadState==='error' && (
            <div style={{ ...card, padding:'12px 16px', borderRadius:'0 0 12px 12px', color:'#FF7676', fontSize:13 }}>
              {t('calc.error')}
            </div>
          )}
          {loadState==='ok' && (
            <select
              style={{ ...input, borderRadius:'0 0 12px 12px', marginTop:0, appearance:'none',
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C9A84C' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:40 }}
              value={selTitre?.symbole||''}
              onChange={e=>{
                const t=filtered.find(x=>x.symbole===e.target.value)||titres.find(x=>x.symbole===e.target.value)
                if(t) onTitreChange(t)
              }}
            >
              {(search ? filtered : titres).filter(t=>t.hasDividende).length>0 && (
                <optgroup label={t('calc.groupDividende')}>
                  {(search ? filtered : titres).filter(t=>t.hasDividende).map(t=>(
                    <option key={t.symbole} value={t.symbole} style={{background:'#0D3B2E'}}>
                      {t.symbole} — {shortNom(t.nom)} · {t.taux.toFixed(2).replace('.',',')}%
                    </option>
                  ))}
                </optgroup>
              )}
              {(search ? filtered : titres).filter(t=>!t.hasDividende).length>0 && (
                <optgroup label={t('calc.groupAutres')}>
                  {(search ? filtered : titres).filter(t=>!t.hasDividende).map(t=>(
                    <option key={t.symbole} value={t.symbole} style={{background:'#0D3B2E'}}>
                      {t.symbole} — {shortNom(t.nom)} · {fmtFull(t.cours)} FCFA
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
        </div>

        {/* Cours */}
        <div style={{ ...card, padding:'16px 18px', marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>{t('calc.coursLabel')}</span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:900, color:OR }}>{fmtFull(cours)} FCFA</span>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:10, lineHeight:1.5 }}>
            {t('calc.coursDesc')}
          </div>
          <input type="number" value={cours} min="1" step="50" onChange={e=>onCoursChange(e.target.value)}
            style={{ width:'100%', background:'#161616', border:'1px solid #2a2a2a', borderRadius:10,
              padding:'12px 14px', color:'#fff', fontFamily:'DM Mono,monospace', fontSize:20, fontWeight:700, outline:'none' }} />
        </div>

        {/* Taux */}
        <div style={{ ...card, padding:'16px 18px', marginBottom:24 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
            {t('calc.rendementLabel')}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:10, lineHeight:1.5 }}>
            {t('calc.rendementDesc')}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="number" min="0.5" max="20" step="0.01" value={taux}
              onChange={e=>setTaux(parseFloat(e.target.value)||0)}
              style={{ ...input, fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:900, color:OR, textAlign:'center', maxWidth:140 }} />
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:14, color:'rgba(255,255,255,0.4)' }}>{t('calc.parAn')}</span>
          </div>
          {selTitre && !selTitre.hasDividende && (
            <div style={{ fontSize:11, color:'rgba(201,168,76,0.6)', marginTop:8 }}>{t('calc.noDividende')}</div>
          )}
        </div>

        <div style={{ ...card, padding:'14px 18px', marginBottom:14, borderColor:'rgba(201,168,76,0.25)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:OR, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
            {t('calc.step2Title')}
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
            {t('calc.step2Desc')}
          </div>
        </div>

        {/* Trio */}
        <div className="calc-trio">
          {[
            { key:'apport', label:t('calc.trioApport'), unit:t('calc.unitFcfa'), val:fmtShort(vals.apport) },
            { key:'duree',  label:t('calc.trioDuree'),  unit:t('calc.unitAns'),  val:t('calc.valAns', { n: vals.duree }) },
            { key:'divann', label:t('calc.trioDivann'), unit:t('calc.unitFcfaAn'), val:result ? fmtShort(locked==='divann'?result.divAnn:vals.divann) : '—' },
          ].map(({key,label,unit,val})=>(
            <div key={key} className={`trio-card${locked===key?' locked':''}`} onClick={()=>setLock(key)}>
              <div className="trio-lbl">{label}</div>
              <div className="trio-val">{val}</div>
              <div className="trio-unit">{unit}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textAlign:'center', marginTop:-10, marginBottom:20, lineHeight:1.5 }}>
          {t('calc.trioHint')}
        </div>

        <div style={{ ...card, padding:'14px 18px', marginBottom:14, borderColor:'rgba(201,168,76,0.25)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:OR, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
            {t('calc.step3Title')}
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
            {t('calc.step3Desc')}
          </div>
        </div>

        {/* Champs des variables non-locked */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:20 }}>
          {Object.entries(SLIDERS).filter(([k])=>k!==locked).map(([key,s])=>(
            <div key={key} style={{ ...card, padding:'16px 18px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                {s.label}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input type="number" min={s.min} max={s.max} step={s.step} value={vals[key]}
                  onChange={e=>updateVal(key,e.target.value)}
                  style={{ ...input, fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:900, color:OR, textAlign:'center', maxWidth:180 }} />
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, color:'rgba(255,255,255,0.4)' }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding:'14px 18px', marginBottom:14, borderColor:'rgba(201,168,76,0.25)' }}>
          <div style={{ fontSize:12, fontWeight:700, color:OR, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
            {t('calc.resultTitle')}
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
            {t('calc.resultDesc')}
          </div>
        </div>

        {/* Résultat principal */}
        {result && (
          <div style={{ background:'linear-gradient(135deg,#0D3B2E,#061A10)', border:'1.5px solid rgba(201,168,76,0.3)',
            borderRadius:20, padding:'28px 24px', textAlign:'center', marginBottom:16, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
              background:'linear-gradient(90deg,transparent,#C9A84C,transparent)' }} />
            <div style={{ fontSize:12, color:GRIS, textTransform:'uppercase', letterSpacing:1.5, marginBottom:12 }}>{resLabel}</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:56, fontWeight:900, color:OR,
              lineHeight:1, letterSpacing:-2, textShadow:'0 0 30px rgba(201,168,76,0.4)' }}>
              {fmtFull(resVal)}
            </div>
            <div style={{ fontSize:14, color:'rgba(201,168,76,0.6)', fontFamily:'DM Mono,monospace', fontWeight:700, marginTop:6, letterSpacing:2 }}>
              {resUnit}
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginTop:16, lineHeight:1.6,
              borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14 }}>
              {resContext}
            </div>
          </div>
        )}

        {/* KPIs */}
        {result && (
          <>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textAlign:'center', marginBottom:12, lineHeight:1.6 }}>
              {t('calc.detailIntro')}
            </div>
            <div className="kpi-grid">
              {[
                { val:kpis.actions,   label:t('calc.kpiActions'),  fmt:v=>Math.round(v).toLocaleString('fr-FR') },
                { val:kpis.portef,    label:t('calc.kpiPortef'),   fmt:fmtShort },
                { val:kpis.capital,   label:t('calc.kpiCapital'),  fmt:fmtShort },
                { val:kpis.divCumul,  label:t('calc.kpiDivCumul'), fmt:fmtShort },
              ].map(({val,label,fmt})=>(
                <div key={label} className="kpi-card">
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:900, color:VERT3, display:'block', lineHeight:1 }}>{fmt(val)}</span>
                  <span style={{ fontSize:10, color:GRIS, letterSpacing:0.3, marginTop:6, display:'block', lineHeight:1.4 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textAlign:'center', marginTop:14, lineHeight:1.7 }}>
              <Trans
                i18nKey="calc.ecartExpl"
                values={{ portef:fmtShort(kpis.portef), capital:fmtShort(kpis.capital), frais:fmtShort(kpis.fraisCumul), reste:fmtShort(kpis.reste) }}
                components={[<strong style={{color:'rgba(255,255,255,0.5)'}} />, <strong style={{color:'rgba(255,255,255,0.5)'}} />]}
              />
            </div>
          </>
        )}

        {/* Comparaison Livret A vs BRVM */}
        {result && (
          <>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textAlign:'center', margin:'20px 0 12px', lineHeight:1.6 }}>
              {t('calc.livretIntro')}
            </div>
            <div className="cmp-grid">
              <div className="cmp bad">
                <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'#FF7676', display:'block', marginBottom:8 }}>{t('calc.livretLabel')}</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:900, color:'#FF7676', display:'block' }}>{fmtShort(livret)}</span>
                <span style={{ fontSize:10, color:GRIS, marginTop:4, display:'block' }}>{t('calc.livretSub')}</span>
              </div>
              <div className="cmp good">
                <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:VERT3, display:'block', marginBottom:8 }}>{t('calc.actionLabel', { sym: selTitre?.symbole || t('calc.actionDefault') })}</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:900, color:VERT3, display:'block' }}>{fmtShort(kpis.divCumul)}</span>
                <span style={{ fontSize:10, color:GRIS, marginTop:4, display:'block' }}>{t('calc.actionSub')}</span>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.25)', lineHeight:1.8, marginTop:20 }}>
          {t('calc.disclaimer1')}<br/>
          {dateData && <>{t('calc.disclaimerSource', { date: dateData })}<br/></>}
          {t('calc.disclaimerAffil')}
        </div>
      </div>
    </section>
  )
}
