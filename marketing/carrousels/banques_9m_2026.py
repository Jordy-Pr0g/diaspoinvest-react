# -*- coding: utf-8 -*-
"""
Carrousel « 4 banques, 4 trajectoires » : résultats à 9 mois 2026 de BOA CI, BOA Sénégal,
Société Générale CI et Ecobank CI, en 3 styles (premium, data, illustre) pour choisir le modèle maison.

DONNÉES (toutes vérifiées le 25-26/11/2026, aucune estimation) :
- Résultats 9 mois 2026 vs 9 mois 2025 : rapports d'activité au 30/09/2026 publiés sur brvm.org
  (données non auditées). M FCFA :
  BOAC RN 29 657 (+11,35 %) · BOAS RN 18 174 (+11,01 %) · SGBC RN 80 418 (-3,5 %) · ECOC RN 38 954 (-12,3 %).
  ECOC : PNB +1,8 % ; crédits nets -1,5 % ; coût net du risque 0,10 % -> 1,1 % ; ROE 29,7 % -> 24,9 %.
- Cours, dernier dividende net, rendement net, PER : Bulletin Officiel de la Cote BRVM du 25/11/2026.
- Bénéfices annuels 2021-2025 (M FCFA) : sikafinance (résultats publiés), recoupés avec les rapports
  (SGBC 2025 = 101 352, BOAS 2025 = 21 905 figurent dans leurs rapports).
Usage : python banques_9m_2026.py   ->  sortie/banques_9m_<style>.pdf + aperçus PNG
"""
from pathlib import Path
import kit
from kit import fr, barres_h, courbes_base100, icone, drapeau, page

ICI = Path(__file__).parent
SORTIE = ICI / "sortie"

RN_9M = [  # (ticker, nom, variation %, RN 9 mois en M FCFA, pays)
    ("BOAC", "BOA Côte d'Ivoire", 11.35, 29657, "CI"),
    ("BOAS", "BOA Sénégal", 11.01, 18174, "SN"),
    ("SGBC", "Société Générale CI", -3.5, 80418, "CI"),
    ("ECOC", "Ecobank Côte d'Ivoire", -12.3, 38954, "CI"),
]
BOC = {  # BOC du 25/11/2026 : cours, dividende net, rendement net %, PER
    "SGBC": (37000, 2298.75, 6.21, 11.36),
    "BOAS": (7495, 450.0, 6.00, 12.32),
    "BOAC": (10845, 597.53, 5.51, 12.21),
    "ECOC": (14500, 781.44, 5.39, 12.57),
}
BENEF = {  # bénéfices annuels 2021 -> 2025, M FCFA
    "BOAC": [16638, 20069, 26075, 32044, 35540],
    "BOAS": [11070, 15581, 17022, 19984, 21905],
    "ECOC": [34304, 44598, 48071, 57477, 63482],
    "SGBC": [67438, 74612, 97230, 101228, 101352],
}
ANNEES = [2021, 2022, 2023, 2024, 2025]
TOP = "Banques BRVM · 9 mois 2026"
TOTAL = 7


def md(v):
    return fr(v / 1000, 1) + " Md F"


MAISON = ("data", "premium")   # style maison : contenu « Data impact », couverture et fin « Premium sobre »


def styles_de(cle):
    """(style du contenu, style de la couverture et de la dernière slide)."""
    base, fort = MAISON if cle == "maison" else (cle, cle)
    return kit.STYLES[base], kit.STYLES[fort]


def slides(cle):
    st, stf = styles_de(cle)
    illu = st["deco"] == "bulles"
    data = st["deco"] == "bande"
    S = []

    # 1. Couverture
    drap = ""
    if illu:
        drap = (f'<div style="display:flex;gap:18px;align-items:center;margin-bottom:34px">{icone("banque", st["accent"], 92)}'
                f'<div style="display:flex;gap:10px">{drapeau("CI", 34)}{drapeau("SN", 34)}</div></div>')
    if data:
        chiffres = (f'<div class="grille2" style="margin-top:60px"><div class="carte" style="padding:36px 30px"><div class="big pos" style="font-size:112px;white-space:nowrap">+11,4 %</div>'
                    f'<div class="txt" style="margin-top:16px">la plus forte hausse<br><b>BOA Côte d&#39;Ivoire</b></div></div>'
                    f'<div class="carte" style="padding:36px 30px"><div class="big neg" style="font-size:112px;white-space:nowrap">−12,3 %</div>'
                    f'<div class="txt" style="margin-top:16px">la plus forte baisse<br><b>Ecobank CI</b></div></div></div>'
                    f'<div class="carte" style="margin-top:22px;display:flex;justify-content:space-around;font-size:30px">'
                    f'<span>BOA Sénégal <b class="pos">+11,0 %</b></span><span>Société Générale CI <b class="neg">−3,5 %</b></span></div>')
    else:
        tuiles = "".join(
            f'<div class="carte" style="padding:26px 28px"><div style="display:flex;justify-content:space-between;align-items:center">'
            f'<span style="font-size:34px;font-weight:800">{t}</span>{drapeau(p, 26) if illu else ""}</div>'
            f'<div style="font-size:22px;color:{stf["doux"]};margin-top:4px">{n}</div>'
            f'<div class="{"pos" if v >= 0 else "neg"}" style="font-size:56px;font-weight:800;margin-top:10px">{fr(v, 1, True)} %</div>'
            f'<div style="font-size:20px;color:{stf["doux"]}">résultat net 9 mois</div></div>'
            for t, n, v, rn, p in RN_9M)
        chiffres = f'<div class="grille2" style="margin-top:54px">{tuiles}</div>'
    S.append(page(stf, TOP, 1, TOTAL, f'''
      <div style="margin-top:{20 if illu else 40}px">{drap}
        <div class="eyebrow">Résultats à fin septembre 2026</div>
        <h1>4 banques cotées.<br><span class="acc">4 trajectoires.</span></h1>
        <p class="lead">BOA Côte d'Ivoire, BOA Sénégal, Société Générale CI et Ecobank CI : <b>ce que disent leurs chiffres</b>, graphiques à l'appui.</p>
      </div>{chiffres}''', swipe=True))

    # 2. Bénéfice 9 mois
    court = {"BOAC": "BOA CI", "BOAS": "BOA Sénégal", "SGBC": "Soc. Générale CI", "ECOC": "Ecobank CI"}
    items = [(t, v, f"{court[t]} · {md(rn)}") for t, n, v, rn, _ in RN_9M]
    S.append(page(st, TOP, 2, TOTAL, f'''
      <div class="eyebrow">Bénéfice net sur 9 mois</div>
      <h2>Deux accélèrent,<br>deux reculent</h2>
      <p class="lead" style="margin-bottom:48px">Variation du résultat net de janvier à septembre 2026, par rapport à la même période de 2025.</p>
      <div class="carte" style="padding:44px 40px">{barres_h(items, st, largeur=820)}</div>''',
      source="rapports d'activité au 30/09/2026 publiés sur brvm.org (non audités)."))

    # 3. 5 ans de bénéfices, base 100
    S.append(page(st, TOP, 3, TOTAL, f'''
      <div class="eyebrow">Sur 5 ans</div>
      <h2>Toutes ont grandi,<br>BOA CI a doublé</h2>
      <p class="lead" style="margin-bottom:30px">Bénéfice annuel, <b>base 100 en 2021</b> : on compare la croissance, pas la taille.</p>
      <div class="carte" style="padding:30px 20px 10px">{courbes_base100(BENEF, ANNEES, st, largeur=860, hauteur=600)}</div>''',
      source="résultats annuels publiés 2021 à 2025 (sikafinance, recoupés avec les rapports des banques)."))

    # 4. Dividende
    div_items = sorted(((t, BOC[t][2], f"{fr(BOC[t][1], 0)} F net par action") for t in BOC), key=lambda x: -x[1])
    S.append(page(st, TOP, 4, TOTAL, f'''
      <div class="eyebrow">Ce que verse chaque action</div>
      <h2>Les 4 dépassent 5 %<br>de rendement net</h2>
      <p class="lead" style="margin-bottom:30px">Dernier dividende net versé, divisé par le cours du 25/11/2026.</p>
      <div class="carte" style="padding:44px 40px">{barres_h(div_items, st, largeur=820, signe=False, zero_centre=False)}
        <p style="margin-top:22px;color:{st["doux"]};font-size:24px;line-height:1.4">Un dividende passé ne garantit pas le prochain : il dépend des bénéfices de l'année.</p></div>''',
      source="Bulletin Officiel de la Cote BRVM du 25/11/2026."))

    # 5. PER
    per_items = sorted(((t, BOC[t][3], f"cours {fr(BOC[t][0], 0)} F") for t in BOC), key=lambda x: x[1])
    S.append(page(st, TOP, 5, TOTAL, f'''
      <div class="eyebrow">Le prix payé</div>
      <h2>Combien tu paies<br>1 F de bénéfice</h2>
      <p class="lead" style="margin-bottom:30px"><b>PER</b> = cours ÷ bénéfice annuel par action. Plus il est bas, moins le bénéfice est payé cher.</p>
      <div class="carte" style="padding:44px 40px">{barres_h(per_items, st, largeur=820, unite=" fois", signe=False, zero_centre=False)}
        <p style="margin-top:22px;color:{st["doux"]};font-size:24px;line-height:1.4">Écart faible entre les quatre : de 11,4 à 12,6 fois le bénéfice.</p></div>''',
      source="Bulletin Officiel de la Cote BRVM du 25/11/2026."))

    # 6. Zoom Ecobank CI
    def ligne(ic, lab, val, cls):
        rond = f'<div class="rond">{icone(ic, st["accent"], 46)}</div>' if illu else ""
        return (f'<div class="carte" style="display:flex;align-items:center;gap:22px;margin-bottom:14px;padding:{"16px 26px" if illu else "24px 30px"}">{rond}'
                f'<div style="flex:1;font-size:28px">{lab}</div><div style="font-size:38px;font-weight:800" class="{cls}">{val}</div></div>')
    S.append(page(st, TOP, 6, TOTAL, f'''
      <div class="eyebrow">Zoom</div>
      <h2>Pourquoi Ecobank CI<br>recule cette année</h2>
      <p class="lead" style="margin-bottom:30px">Les revenus tiennent. Ce sont les <b>provisions pour crédits à risque</b> qui pèsent sur le bénéfice.</p>
      {ligne("courbe", "Revenus bancaires (PNB)", "+1,8 %", "pos")}
      {ligne("alerte", "Coût net du risque", "0,1 % → 1,1 %", "neg")}
      {ligne("banque", "Crédits nets accordés", "−1,5 %", "neg")}
      {ligne("piece", "Rentabilité des fonds propres", "29,7 % → 24,9 %", "neg")}
      {ligne("loupe", "Résultat net 9 mois", "−12,3 %", "neg")}''',
      source="rapport d'activité Ecobank Côte d'Ivoire au 30/09/2026 (brvm.org, non audité)."))

    # 7. À retenir + CTA
    def puce(ic, txt):
        rond = f'<div class="rond">{icone(ic, stf["accent"], 46)}</div>' if illu else f'<div style="width:14px;height:14px;margin-top:16px;border-radius:50%;background:{stf["accent"]};flex:0 0 auto"></div>'
        return f'<div class="puce">{rond}<div>{txt}</div></div>'
    S.append(page(stf, TOP, 7, TOTAL, f'''
      <div class="eyebrow">À retenir</div>
      <h2>Ce que disent<br>les chiffres</h2>
      {puce("courbe", "<b>Croissance cette année</b> : BOA Côte d'Ivoire et BOA Sénégal, environ +11 % sur 9 mois.")}
      {puce("piece", "<b>Dividende le plus élevé</b> : Société Générale CI, 6,2 % net au cours du 25/11.")}
      {puce("alerte", "<b>En recul cette année</b> : Ecobank CI (−12,3 %), après 5 ans de hausse.")}
      {puce("loupe", "Un bon choix ne se lit pas sur un seul chiffre : <b>croissance, dividende et prix</b> se lisent ensemble.")}
      <div class="carte" style="margin-top:34px;border-color:{stf["accent"]}">
        <div class="fleche">Ressource gratuite</div>
        <div class="txt" style="margin-top:8px">Apprends à lire un rapport d'activité BRVM : <b>diaspoinvest.fr</b></div>
      </div>
      <p style="font-size:20px;color:{stf["doux"]};margin-top:26px;line-height:1.45">Jordan, DiaspoInvest. Contenu éducatif, ceci n'est pas un conseil en investissement. Non affilié à la BRVM ni à l'AMF-UMOA.</p>''',
      swipe=False))
    return S


def main(styles=("maison",), fmt="portrait"):
    w, h = kit.FORMATS[fmt]
    for cle in styles:
        st, stf = styles_de(cle)
        html = kit.document([st, stf], slides(cle), w, h)
        assert "—" not in html and "–" not in html, "tiret long interdit"
        (SORTIE / f"banques_9m_{cle}.html").parent.mkdir(parents=True, exist_ok=True)
        (SORTIE / f"banques_9m_{cle}.html").write_text(html, encoding="utf-8")
        n = kit.rendre(html, SORTIE / f"banques_9m_{cle}.pdf", w, h, apercu_png=SORTIE / f"apercu_{cle}.png")
        print(f"{cle:10} {n} slides -> sortie/banques_9m_{cle}.pdf")


if __name__ == "__main__":
    main()
