# -*- coding: utf-8 -*-
"""
Kit carrousels DiaspoInvest : 3 styles, graphiques SVG calculés à partir des données (jamais dessinés
à la main), rendu HTML -> PDF -> PNG avec Chrome headless (Playwright se bloque dans cet environnement).

Styles :
  premium  : vert profond + or, Cinzel, beaucoup d'espace (charte DiaspoInvest)
  data     : fond clair, très gros chiffres, graphiques dominants (infographie)
  illustre : sable chaleureux, icônes, cartes arrondies, drapeaux (pédagogique)

Formats : 1080x1350 (LinkedIn / Instagram), 1080x1920 (TikTok / stories), 1080x1080 (carré).
Règles maison : zéro chiffre inventé (tout vient du sujet), zéro tiret long, pas de conseil,
disclaimer « Non affilié à la BRVM ni à l'AMF-UMOA », signature « Jordan, DiaspoInvest ».
"""
import os
import subprocess
import tempfile
from pathlib import Path

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FORMATS = {"portrait": (1080, 1350), "story": (1080, 1920), "carre": (1080, 1080)}

STYLES = {
    "premium": dict(
        nom="Premium sobre",
        bg="linear-gradient(160deg,#0F4A37 0%,#0A3B2C 45%,#05211A 100%)",
        texte="#F4EFE2", doux="#A9BFB3", accent="#D4AF37", pos="#D4AF37", neg="#E58B6D",
        carte="rgba(255,255,255,0.05)", bord="rgba(212,175,55,0.35)", grille="rgba(255,255,255,0.10)",
        titre_font="'Cinzel', serif", titre_poids=700, titre_casse="none",
        corps_font="'DM Sans', sans-serif", rayon=6, deco="cercle_or", sombre=True,
        series=["#D4AF37", "#7FD1AE", "#E58B6D", "#C9D6CE"],
    ),
    "data": dict(
        nom="Data impact",
        bg="#FBF8F1",
        texte="#0D2B1E", doux="#5E6E66", accent="#C9A227", pos="#1F8A5B", neg="#C8553D",
        carte="#FFFFFF", bord="rgba(13,43,30,0.10)", grille="rgba(13,43,30,0.10)",
        titre_font="'DM Sans', sans-serif", titre_poids=800, titre_casse="uppercase",
        corps_font="'DM Sans', sans-serif", rayon=14, deco="bande", sombre=False,
        series=["#C9A227", "#1F8A5B", "#C8553D", "#5E6E66"],
    ),
    "illustre": dict(
        nom="Éducatif illustré",
        bg="radial-gradient(circle at 85% 8%,#F9F2E4 0,#F3EBDD 40%,#EDE2CF 100%)",
        texte="#1E2A24", doux="#66716B", accent="#B8892B", pos="#2E7D5B", neg="#C0583F",
        carte="#FFFDF8", bord="rgba(30,42,36,0.08)", grille="rgba(30,42,36,0.10)",
        titre_font="'DM Sans', sans-serif", titre_poids=700, titre_casse="none",
        corps_font="'DM Sans', sans-serif", rayon=28, deco="bulles", sombre=False,
        series=["#B8892B", "#2E7D5B", "#C0583F", "#66716B"],
    ),
}


for _cle, _st in STYLES.items():
    _st["cle"] = _cle


def fr(v, dec=1, signe=False):
    """12.3 -> « 12,3 » ; signe=True -> « +12,3 » / « −12,3 » (moins typographique, pas un tiret long).
    Arrondi commercial (11,35 -> 11,4), comme dans les rapports."""
    from decimal import Decimal, ROUND_HALF_UP
    q = Decimal(str(abs(v))).quantize(Decimal(1).scaleb(-dec), rounding=ROUND_HALF_UP)
    s = f"{q:,.{dec}f}".replace(",", " ").replace(".", ",")
    if signe:
        return ("+" if v > 0 else "\u2212" if v < 0 else "") + s
    return ("\u2212" if v < 0 else "") + s


# ---------------------------------------------------------------- icônes (SVG simples, maison)
def icone(nom, couleur, taille=64):
    p = {
        "banque": '<path d="M8 26 L32 12 L56 26 Z" /><rect x="12" y="29" width="6" height="18"/><rect x="24" y="29" width="6" height="18"/>'
                  '<rect x="36" y="29" width="6" height="18"/><rect x="48" y="29" width="4" height="18"/><rect x="8" y="49" width="48" height="5"/>',
        "piece": '<circle cx="32" cy="32" r="20" fill="none" stroke-width="5"/><path d="M32 20 v24 M26 26 h9 a4 4 0 0 1 0 8 h-6 a4 4 0 0 0 0 8 h9" fill="none" stroke-width="4"/>',
        "courbe": '<path d="M8 50 L22 36 L32 42 L48 20 L56 26" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 56 H56" stroke-width="3"/>',
        "loupe": '<circle cx="27" cy="27" r="14" fill="none" stroke-width="5"/><path d="M38 38 L54 54" stroke-width="6" stroke-linecap="round"/>',
        "balance": '<path d="M32 10 V52 M18 52 H46 M12 20 H52" stroke-width="4" fill="none"/><path d="M12 20 L6 36 H18 Z M52 20 L46 36 H58 Z" stroke-width="3" fill="none"/>',
        "alerte": '<path d="M32 8 L58 54 H6 Z" fill="none" stroke-width="5" stroke-linejoin="round"/><path d="M32 24 V38" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="46" r="3"/>',
    }[nom]
    return (f'<svg width="{taille}" height="{taille}" viewBox="0 0 64 64" fill="{couleur}" stroke="{couleur}" '
            f'xmlns="http://www.w3.org/2000/svg">{p}</svg>')


def drapeau(pays, h=26):
    w = int(h * 1.5)
    if pays == "CI":
        return (f'<svg width="{w}" height="{h}" viewBox="0 0 3 2"><rect width="1" height="2" fill="#F77F00"/>'
                f'<rect x="1" width="1" height="2" fill="#FFF"/><rect x="2" width="1" height="2" fill="#009E60"/></svg>')
    if pays == "SN":
        return (f'<svg width="{w}" height="{h}" viewBox="0 0 3 2"><rect width="1" height="2" fill="#00853F"/>'
                f'<rect x="1" width="1" height="2" fill="#FDEF42"/><rect x="2" width="1" height="2" fill="#E31B23"/>'
                f'<path d="M1.5 0.72 l0.08 0.24 h0.25 l-0.2 0.15 l0.08 0.24 l-0.21 -0.15 l-0.21 0.15 l0.08 -0.24 l-0.2 -0.15 h0.25 z" fill="#00853F"/></svg>')
    return ""


# ---------------------------------------------------------------- graphiques (SVG calculés)
def barres_h(items, st, largeur=900, h_barre=92, unite=" %", dec=1, signe=True, zero_centre=None, valeur_size=46):
    """Barres horizontales. items = [(libellé, valeur, sous-libellé)]. Gère les valeurs négatives
    (axe zéro au milieu) ; la longueur est proportionnelle à la valeur (aucune mise à l'échelle trompeuse)."""
    vals = [v for _, v, _ in items]
    neg = min(vals) < 0 if zero_centre is None else zero_centre
    gauche_lab = 250
    zone = largeur - gauche_lab - (210 if (min(vals) < 0 if zero_centre is None else zero_centre) else 60 + 26 * len(unite) + 70)
    vmax = max(abs(v) for v in vals) or 1
    x0 = gauche_lab + (zone / 2 if neg else 0)
    echelle = (zone / 2 if neg else zone) / vmax
    gap = 38
    h = len(items) * (h_barre + gap)
    out = [f'<svg width="{largeur}" height="{h + 10}" viewBox="0 0 {largeur} {h + 10}" xmlns="http://www.w3.org/2000/svg" '
           f'style="font-family:{st["corps_font"]}">']
    if neg:
        out.append(f'<line x1="{x0}" y1="0" x2="{x0}" y2="{h}" stroke="{st["doux"]}" stroke-width="2" stroke-dasharray="6 6"/>')
    for i, (lab, v, sous) in enumerate(items):
        y = i * (h_barre + gap)
        lg = abs(v) * echelle
        coul = st["pos"] if v >= 0 else st["neg"]
        x = x0 if v >= 0 else x0 - lg
        out.append(f'<text x="0" y="{y + h_barre / 2 + 2}" font-size="38" font-weight="800" fill="{st["texte"]}">{lab}</text>')
        if sous:
            out.append(f'<text x="0" y="{y + h_barre / 2 + 36}" font-size="22" fill="{st["doux"]}">{sous}</text>')
        out.append(f'<rect x="{x:.1f}" y="{y}" width="{max(lg, 4):.1f}" height="{h_barre}" rx="{min(st["rayon"], 14)}" fill="{coul}"/>')
        # valeur toujours à droite de l'axe : une barre négative part à gauche, son chiffre reste lisible
        tx = (x + lg + 16) if v >= 0 else (x0 + 16)
        anchor = "start"
        out.append(f'<text x="{tx:.1f}" y="{y + h_barre / 2 + 14}" font-size="{valeur_size}" font-weight="800" '
                   f'text-anchor="{anchor}" fill="{coul}">{fr(v, dec, signe)}{unite}</text>')
    out.append("</svg>")
    return "".join(out)


def courbes_base100(series, annees, st, largeur=900, hauteur=620, couleurs=None):
    """Courbes en base 100 (première année = 100) : compare des sociétés de tailles différentes sans tricher."""
    noms = list(series)
    idx = {n: [v / series[n][0] * 100 for v in series[n]] for n in noms}
    vmax = max(max(s) for s in idx.values())
    vmin = 80
    g, d, hh, b = 70, 170, 30, 60
    W, H = largeur - g - d, hauteur - hh - b
    X = lambda i: g + i * W / (len(annees) - 1)
    Y = lambda v: hh + H - (v - vmin) / (vmax * 1.05 - vmin) * H
    couleurs = couleurs or st["series"]
    out = [f'<svg width="{largeur}" height="{hauteur}" viewBox="0 0 {largeur} {hauteur}" xmlns="http://www.w3.org/2000/svg" '
           f'style="font-family:{st["corps_font"]}">']
    for v in (100, 150, 200):
        if v <= vmax * 1.05:
            out.append(f'<line x1="{g}" x2="{g + W}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{st["grille"]}" stroke-width="2"/>'
                       f'<text x="{g - 12}" y="{Y(v) + 8:.1f}" font-size="22" text-anchor="end" fill="{st["doux"]}">{v}</text>')
    for i, a in enumerate(annees):
        out.append(f'<text x="{X(i):.1f}" y="{hauteur - 18}" font-size="24" text-anchor="middle" fill="{st["doux"]}">{a}</text>')
    fins = sorted(((idx[n][-1], n, couleurs[k % len(couleurs)]) for k, n in enumerate(noms)), reverse=True)
    y_lab, dernier = {}, None
    for v, n, _ in fins:          # étiquettes de fin espacées pour ne pas se chevaucher
        y = Y(v)
        if dernier is not None and y - dernier < 46:
            y = dernier + 46
        y_lab[n], dernier = y, y
    for k, n in enumerate(noms):
        c = couleurs[k % len(couleurs)]
        pts = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(idx[n]))
        out.append(f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>')
        out.append(f'<circle cx="{X(len(annees) - 1):.1f}" cy="{Y(idx[n][-1]):.1f}" r="10" fill="{c}"/>')
        out.append(f'<text x="{X(len(annees) - 1) + 22:.1f}" y="{y_lab[n] + 10:.1f}" font-size="30" font-weight="800" fill="{c}">'
                   f'{n} <tspan font-weight="500" font-size="24">{fr(idx[n][-1], 0)}</tspan></text>')
    out.append("</svg>")
    return "".join(out)


# ---------------------------------------------------------------- page HTML
def css(st, w, h):
    sombre = st["sombre"]
    deco = {
        "cercle_or": f'.slide::before{{content:"";position:absolute;width:820px;height:820px;border-radius:50%;right:-360px;top:-380px;'
                     f'background:radial-gradient(circle,rgba(212,175,55,0.22) 0%,rgba(212,175,55,0.06) 45%,transparent 70%);}}'
                     f'.slide::after{{content:"";position:absolute;left:90px;right:90px;bottom:116px;height:1px;background:{st["bord"]};}}',
        "bande": f'.slide::before{{content:"";position:absolute;left:0;top:0;right:0;height:14px;background:linear-gradient(90deg,#0D2B1E 0 70%,{st["accent"]} 70% 100%);}}',
        "bulles": f'.slide::before{{content:"";position:absolute;width:420px;height:420px;border-radius:50%;right:-150px;bottom:-140px;background:rgba(184,137,43,0.10);}}'
                  f'.slide::after{{content:"";position:absolute;width:220px;height:220px;border-radius:50%;left:-70px;top:180px;background:rgba(13,43,30,0.06);}}',
    }[st["deco"]]
    return portee(f"""
.slide {{ width:{w}px; height:{h}px; position:relative; overflow:hidden; background:{st["bg"]}; color:{st["texte"]};
  font-family:{st["corps_font"]}; padding:92px 90px 120px; display:flex; flex-direction:column; page-break-after:always; }}
{deco}
.slide > * {{ position:relative; z-index:1; }}
.top {{ display:flex; justify-content:space-between; align-items:center; font-size:22px; letter-spacing:3px; text-transform:uppercase;
  color:{st["doux"]}; font-weight:600; margin-bottom:44px; }}
.top b {{ color:{st["accent"]}; }}
.eyebrow {{ font-size:26px; letter-spacing:4px; text-transform:uppercase; color:{st["accent"]}; font-weight:700; margin-bottom:20px; }}
h1 {{ font-family:{st["titre_font"]}; font-weight:{st["titre_poids"]}; text-transform:{st["titre_casse"]}; font-size:84px; line-height:1.04; letter-spacing:-0.5px; }}
h2 {{ font-family:{st["titre_font"]}; font-weight:{st["titre_poids"]}; text-transform:{st["titre_casse"]}; font-size:58px; line-height:1.1; margin-bottom:18px; }}
.lead {{ font-size:32px; line-height:1.45; color:{st["doux"]}; margin-top:22px; }}
.lead b, .txt b {{ color:{st["texte"]}; }}
.txt {{ font-size:30px; line-height:1.5; }}
.big {{ font-size:190px; font-weight:800; line-height:0.95; letter-spacing:-4px; }}
.carte {{ background:{st["carte"]}; border:1px solid {st["bord"]}; border-radius:{st["rayon"]}px; padding:30px 34px;
  {'box-shadow:0 18px 40px rgba(13,43,30,0.08);' if not sombre else ''} }}
.grille2 {{ display:grid; grid-template-columns:1fr 1fr; gap:22px; }}
.pos {{ color:{st["pos"]}; }} .neg {{ color:{st["neg"]}; }} .acc {{ color:{st["accent"]}; }}
.puce {{ display:flex; gap:22px; align-items:flex-start; margin:18px 0; font-size:30px; line-height:1.45; }}
.rond {{ flex:0 0 auto; width:84px; height:84px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:{'rgba(212,175,55,0.14)' if sombre else 'rgba(184,137,43,0.14)'}; }}
.src {{ position:absolute; left:90px; right:90px; bottom:76px; font-size:19px; color:{st["doux"]}; line-height:1.4; }}
.pied {{ position:absolute; left:90px; right:90px; bottom:34px; display:flex; justify-content:space-between; font-size:20px;
  color:{st["doux"]}; letter-spacing:1px; }}
.pied b {{ color:{st["accent"]}; }}
.fleche {{ font-size:24px; color:{st["accent"]}; font-weight:700; letter-spacing:2px; text-transform:uppercase; }}
""", st["cle"])


def portee(regles, cle):
    """Limite les règles d'un style aux slides de ce style (.th-<cle>) : un même carrousel peut
    mélanger les styles (couverture premium, contenu data)."""
    import re

    def pref(m):
        out = []
        for s in m.group(1).split(","):
            s = s.strip()
            out.append(f".slide.th-{cle}{s[len('.slide'):]}" if s.startswith(".slide") else f".th-{cle} {s}")
        return ", ".join(out) + " {"
    return re.sub(r"([^{}]+)\{", pref, regles)


def page(st, top_gauche, num, total, contenu, source=None, swipe=True):
    src = f'<div class="src">Source : {source}</div>' if source else ""
    pied = (f'<div class="pied"><span><b>DiaspoInvest</b> · diaspoinvest.fr</span>'
            f'<span>{"Glisse →" if swipe and num < total else "Éducatif, pas un conseil"}</span></div>')
    return (f'<section class="slide th-{st["cle"]}"><div class="top"><span>{top_gauche}</span><span><b>{num}</b> / {total}</span></div>'
            f'{contenu}{src}{pied}</section>')


def document(styles, slides_html, w, h):
    """styles : un style ou une liste (carrousel mixte)."""
    styles = styles if isinstance(styles, (list, tuple)) else [styles]
    base = f"@page {{ size:{w}px {h}px; margin:0; }} * {{ box-sizing:border-box; margin:0; padding:0; }} body {{ background:#222; }}"
    return ('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">'
            '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
            f'<style>{base}{"".join(css(s, w, h) for s in styles)}</style></head><body>{"".join(slides_html)}</body></html>')


def rendre(html, sortie_pdf, w, h, apercu_png=None, colonnes=4):
    """HTML -> PDF (Chrome headless) -> planche PNG d'aperçu. Chrome ne peut pas écrire partout :
    on passe par un dossier temporaire puis on copie."""
    tmp = Path(tempfile.mkdtemp(prefix="carrousel_"))
    f_html, f_pdf = tmp / "c.html", tmp / "c.pdf"
    f_html.write_text(html, encoding="utf-8")
    # profil Chrome séparé : sans lui, Chrome headless attend le Chrome ouvert de Jordan (rendu de plusieurs minutes)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={tmp / 'profil'}",
                    "--no-pdf-header-footer", "--virtual-time-budget=15000",
                    "--run-all-compositor-stages-before-draw", f"--print-to-pdf={f_pdf}", f_html.as_uri()],
                   check=True, capture_output=True, timeout=180)
    Path(sortie_pdf).parent.mkdir(parents=True, exist_ok=True)
    Path(sortie_pdf).write_bytes(f_pdf.read_bytes())
    pages = []
    if apercu_png:
        import fitz
        from PIL import Image
        doc = fitz.open(sortie_pdf)
        for pg in doc:
            pix = pg.get_pixmap(dpi=40)
            pages.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
        pw, ph = pages[0].size
        lignes = (len(pages) + colonnes - 1) // colonnes
        planche = Image.new("RGB", (colonnes * pw + (colonnes + 1) * 12, lignes * ph + (lignes + 1) * 12), (40, 40, 40))
        for i, im in enumerate(pages):
            planche.paste(im, (12 + (i % colonnes) * (pw + 12), 12 + (i // colonnes) * (ph + 12)))
        planche.save(apercu_png)
        # slides en pleine résolution (pour vérifier et publier en images)
        dossier = Path(apercu_png).with_suffix("")
        dossier.mkdir(exist_ok=True)
        for i, pg in enumerate(doc):
            pg.get_pixmap(dpi=96).save(dossier / f"slide_{i + 1:02d}.png")
    return len(pages)
