# -*- coding: utf-8 -*-
"""
Carrousel S1 BRVM v2 — Style Matthieu Louvet
6 slides · 1 idée par slide · histoire personnelle · 1 CTA
"""
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
import os

OUT  = r"C:\Users\DJIOKAP JORDAN\DiaspoInvest\content\carrousels\DiaspoInvest Carrousel LinkedIn BRVM.pdf"
LOGO = r"C:\Users\DJIOKAP JORDAN\DiaspoInvest\branding\logo-horizontal-transparent.png"

SCRDIR = r'C:\Users\DJIOKA~1\AppData\Local\Temp\claude\C--Users-DJIOKAP-JORDAN--claude\4b0c18f3-3937-45cc-aa69-df5fc40d34c8\scratchpad'
IMG_SCREENER = SCRDIR + r'\screener_tableau.png'
IMG_BACKTEST = SCRDIR + r'\backtest_chart.png'
IMG_GRAPHIQUE = SCRDIR + r'\backtest_graphique.png'

FOND  = HexColor('#060E09')
VERT  = HexColor('#0D3B2E')
VERT2 = HexColor('#0A1E12')
VERT3 = HexColor('#1A3A28')
OR    = HexColor('#D4AF37')
OR2   = HexColor('#F5D67A')
OR3   = HexColor('#C9A830')
GRIS  = HexColor('#AAAAAA')
BLANC = white
VERT_HL = HexColor('#4CAF7D')
ROUGE   = HexColor('#E05252')

W = H = 1080

def new_slide(c):
    c.showPage()
    c.setPageSize((W, H))

def bg(c, color=None):
    c.setFillColor(color or FOND)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def glow(c, cx, cy, r, color, alpha=0.3):
    for i in range(10, 0, -1):
        c.setFillColor(color)
        c.setFillAlpha(alpha * i / 10 * 0.3)
        c.circle(cx, cy, r * i / 10, fill=1, stroke=0)
    c.setFillAlpha(1)

def grid(c, spacing=54, alpha=0.05):
    c.saveState()
    c.setStrokeColor(HexColor('#1A6B4A'))
    c.setStrokeAlpha(alpha)
    c.setLineWidth(0.5)
    for x in range(0, W + spacing, spacing):
        c.line(x, 0, x, H)
    for y in range(0, H + spacing, spacing):
        c.line(0, y, W, y)
    c.restoreState()

def brand(c):
    try:
        c.drawImage(LOGO, 40, 18, width=83, height=48, mask='auto')
    except Exception:
        c.setFillColor(OR)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(44, 32, 'DIASPOINVEST')
    c.setFillAlpha(1)

def slide_num(c, n, total=6):
    c.setFillColor(OR)
    c.setFillAlpha(0.45)
    c.setFont('Helvetica-Bold', 13)
    c.drawRightString(W - 44, H - 50, f'{n} / {total}')
    c.setFillAlpha(1)

def barre_or(c, x, y, w=60, h=5):
    c.setFillColor(OR)
    c.roundRect(x, y, w, h, 2, fill=1, stroke=0)

def card(c, x, y, w, h, bg_col, bord_col=None, left_bar=False):
    c.setFillColor(bg_col)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    if bord_col:
        c.setStrokeColor(bord_col)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, 12, fill=0, stroke=1)
    if left_bar:
        c.setFillColor(OR)
        c.roundRect(x, y, 5, h, 2, fill=1, stroke=0)

# ═══════════════════════════════
# SLIDE 1 — HISTOIRE PERSONNELLE
# ═══════════════════════════════
def s1(c):
    bg(c)
    glow(c, W - 200, H - 150, 700, VERT, 0.4)
    grid(c)
    slide_num(c, 1)
    brand(c)

    # Eyebrow
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 870, 'MON HISTOIRE')
    barre_or(c, 80, 854, 100)

    # Titre principal
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 72)
    c.drawString(80, 730, 'Pendant 2 ans,')
    c.drawString(80, 642, "j'ai cherche")
    c.drawString(80, 554, 'comment investir')
    c.setFillColor(OR2)
    c.drawString(80, 464, 'en Afrique.')

    # Corps
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 22)
    c.drawString(80, 390, "En M2 Finance a l'INSEEC Paris, j'analysais des ETF, du MSCI World,")
    c.drawString(80, 362, "des indices europeens. Tout pointait vers les memes marches.")
    c.drawString(80, 316, "J'ai fini par poser la question : il existe quelque chose")
    c.drawString(80, 288, "pour investir au pays ?")

    # Teaser
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(80, 220, "La reponse m'a surpris.")
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 17)
    c.drawString(80, 192, 'Ce carrousel resume ce que j\'ai appris.')

    # Swipe
    c.setFillColor(OR3)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 130, u'→  FAIS DEFILER')

# ═══════════════════════════════
# SLIDE 2 — LE CHIFFRE CLÉ
# ═══════════════════════════════
def s2(c):
    bg(c)
    glow(c, 200, 600, 500, VERT, 0.35)
    slide_num(c, 2)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 870, 'LE CHIFFRE')
    barre_or(c, 80, 854, 80)

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 32)
    c.drawString(80, 790, 'Sonatel verse chaque annee :')

    # Grand chiffre
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 140)
    c.drawString(60, 590, '6,13')
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 50)
    c.drawString(80, 548, '%  de rendement brut')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 20)
    c.drawString(80, 500, '1 740 FCFA de dividende par action.')
    c.drawString(80, 472, '1 action = 28 400 FCFA (~43 EUR au cours actuel).')

    # Separateur
    c.setStrokeColor(VERT3)
    c.setLineWidth(1)
    c.line(80, 440, W - 80, 440)

    # Comparatif — 3 cartes propres, rien en-dessous
    comparatif = [
        ('Livret A France',    '1,5 %',  ROUGE),
        ('Epargne UEMOA moy.', '3,5 %',  GRIS),
        ('BRVM — Sonatel',     '6,13 %', VERT_HL),
    ]
    bw = (W - 200) / 3
    for i, (label, val, col) in enumerate(comparatif):
        x = 80 + i * (bw + 20)
        c.setFillColor(VERT2 if i < 2 else VERT)
        c.roundRect(x, 200, bw, 210, 10, fill=1, stroke=0)
        if i == 2:
            c.setStrokeColor(VERT_HL)
            c.setLineWidth(1.5)
            c.roundRect(x, 200, bw, 210, 10, fill=0, stroke=1)
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 36)
        c.drawCentredString(x + bw / 2, 330, val)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 13)
        c.drawCentredString(x + bw / 2, 220, label)

    c.setFillColor(GRIS)
    c.setFont('Helvetica-Oblique', 12)
    c.drawString(80, 158, 'Donnees BRVM · juin 2026 · Dividende dernier exercice fiscal connu · Pas une garantie de rendement futur')

# ═══════════════════════════════
# SLIDE 3 — L'OUTIL (SCREENER)
# ═══════════════════════════════
def s3(c):
    bg(c)
    glow(c, W / 2, 400, 600, VERT, 0.3)
    slide_num(c, 3)
    brand(c)

    # Titre
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 870, "L'OUTIL")
    barre_or(c, 80, 854, 55)

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 52)
    c.drawString(80, 770, 'Toutes les actions.')
    c.setFillColor(OR2)
    c.drawString(80, 706, 'En un coup d\'oeil.')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 21)
    c.drawString(80, 660, '47 actions filtrables par rendement, secteur, pays.')
    c.drawString(80, 630, 'Cours en temps reel. Dividendes. Backtest integre.')

    # Screenshot screener — zone propre dédiée, rien autour
    img_y = 120
    img_h = 480
    img_x = 60
    img_w = W - 120

    # Fond sombre légèrement décalé (ombre)
    c.setFillColor(HexColor('#000000'))
    c.setFillAlpha(0.4)
    c.roundRect(img_x + 6, img_y - 6, img_w, img_h, 14, fill=1, stroke=0)
    c.setFillAlpha(1)

    # Image propre
    try:
        c.drawImage(IMG_SCREENER, img_x, img_y, width=img_w, height=img_h,
                    mask='auto', preserveAspectRatio=False)
    except Exception:
        c.setFillColor(VERT2)
        c.roundRect(img_x, img_y, img_w, img_h, 14, fill=1, stroke=0)

    # Bordure dorée fine par-dessus
    c.setStrokeColor(OR3)
    c.setLineWidth(1.5)
    c.roundRect(img_x, img_y, img_w, img_h, 14, fill=0, stroke=1)

    # URL caption
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(W / 2, 88, u'diaspoinvest.fr/screener')

# ═══════════════════════════════
# SLIDE 4 — FISCALITÉ RÉELLE
# ═══════════════════════════════
def s4(c):
    bg(c)
    glow(c, W / 2, 300, 500, VERT, 0.3)
    slide_num(c, 4)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 870, 'TA FISCALITE REELLE')
    barre_or(c, 80, 854, 140)

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 42)
    c.drawString(80, 780, 'Ce que tu touches vraiment.')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 22)
    c.drawString(80, 744, 'Apres impot, le rendement Sonatel reste devant le Livret A.')

    pays_data = [
        ('France',        'Flat tax 30 %',   '4,29 %', 'x 2,9 le Livret A', ROUGE,   False),
        ('Senegal',       'IRVM 10 %',        '5,52 %', 'x 3,7 le Livret A', VERT_HL, False),
        ("Cote d'Ivoire", 'IRVM 12 %',        '5,39 %', 'x 3,6 le Livret A', VERT_HL, False),
        ('Benin',         'IRVM 10 %',        '5,52 %', 'x 3,7 le Livret A', VERT_HL, False),
    ]

    cw = (W - 160 - 3 * 14) / 4
    y0 = 480
    ch = 240

    for i, (pays, impot, net, mult, col, _) in enumerate(pays_data):
        x = 80 + i * (cw + 14)
        c.setFillColor(VERT2)
        c.roundRect(x, y0, cw, ch, 10, fill=1, stroke=0)
        c.setStrokeColor(col)
        c.setLineWidth(1.5)
        c.roundRect(x, y0, cw, ch, 10, fill=0, stroke=1)
        # Pays
        c.setFillColor(BLANC)
        c.setFont('Helvetica-Bold', 15)
        c.drawCentredString(x + cw / 2, y0 + ch - 32, pays)
        # Taux impot
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 13)
        c.drawCentredString(x + cw / 2, y0 + ch - 58, impot)
        # Separateur
        c.setStrokeColor(VERT3)
        c.setLineWidth(0.5)
        c.line(x + 12, y0 + ch - 74, x + cw - 12, y0 + ch - 74)
        # Net
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 36)
        c.drawCentredString(x + cw / 2, y0 + 126, net)
        c.setFont('Helvetica', 11)
        c.setFillColor(GRIS)
        c.drawCentredString(x + cw / 2, y0 + 104, 'net apres impot')
        # Multiplicateur
        c.setFillColor(col)
        c.setFillAlpha(0.2)
        c.roundRect(x + 10, y0 + 12, cw - 20, 48, 6, fill=1, stroke=0)
        c.setFillAlpha(1)
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 13)
        c.drawCentredString(x + cw / 2, y0 + 34, mult)

    # Bonus UEMOA
    card(c, 60, 300, W - 120, 150, VERT, OR3, left_bar=True)
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(88, 416, 'BONUS ZONE UEMOA — Plus-values totalement exonerees')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 16)
    c.drawString(88, 386, 'Tu revends tes actions avec un gain : tu gardes 100 %.')
    c.drawString(88, 360, 'Avantage que les investisseurs en France n\'ont pas.')

    c.setFillColor(GRIS)
    c.setFont('Helvetica-Oblique', 11)
    c.drawString(80, 260, 'Calculs bases sur Sonatel 6,13 % rendement brut · Informez-vous aupres d\'un conseiller fiscal')

# ═══════════════════════════════
# SLIDE 5 — SIMULATION DCA (graphique réel)
# ═══════════════════════════════
def s5(c):
    bg(c)
    glow(c, W / 2, 300, 500, VERT, 0.3)
    slide_num(c, 5)
    brand(c)

    # Eyebrow
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 870, 'ET CONCRETEMENT ?')
    barre_or(c, 80, 854, 150)

    # Titre + résultat phare
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 50)
    c.drawString(80, 768, '50 000 FCFA / mois dans Sonatel.')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 21)
    c.drawString(80, 726, 'En DCA mensuel depuis janvier 2020 (simulation reelle) :')

    # Chiffres clés — ligne horizontale 4 métriques
    metrics = [
        ('Valeur actuelle',  '5 461 900', 'FCFA',      OR2),
        ('Capital investi',  '3 177 735', 'FCFA',      GRIS),
        ('Performance',      '+71,9',     '%',         VERT_HL),
        ('Dividende / an',   '335 820',   'FCFA/an',   OR),
    ]
    mw = (W - 160 - 3 * 14) / 4
    my = 560
    mh = 140
    for i, (label, val, unit, col) in enumerate(metrics):
        mx = 80 + i * (mw + 14)
        c.setFillColor(VERT2)
        c.roundRect(mx, my, mw, mh, 10, fill=1, stroke=0)
        c.setStrokeColor(col)
        c.setLineWidth(1.2)
        c.roundRect(mx, my, mw, mh, 10, fill=0, stroke=1)
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 24)
        c.drawCentredString(mx + mw / 2, my + mh - 44, val)
        c.setFillColor(col)
        c.setFillAlpha(0.7)
        c.setFont('Helvetica-Bold', 13)
        c.drawCentredString(mx + mw / 2, my + mh - 64, unit)
        c.setFillAlpha(1)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 11)
        c.drawCentredString(mx + mw / 2, my + 18, label)

    # Graphique réel — zone propre dédiée dans la partie basse
    img_y = 80
    img_h = 450
    img_x = 60
    img_w = W - 120

    # Ombre
    c.setFillColor(HexColor('#000000'))
    c.setFillAlpha(0.35)
    c.roundRect(img_x + 6, img_y - 6, img_w, img_h, 14, fill=1, stroke=0)
    c.setFillAlpha(1)

    try:
        c.drawImage(IMG_GRAPHIQUE, img_x, img_y, width=img_w, height=img_h,
                    mask='auto', preserveAspectRatio=False)
    except Exception:
        c.setFillColor(VERT2)
        c.roundRect(img_x, img_y, img_w, img_h, 14, fill=1, stroke=0)
        c.setFillColor(VERT_HL)
        c.setFont('Helvetica-Bold', 20)
        c.drawCentredString(W / 2, img_y + img_h / 2, 'Simulation sur diaspoinvest.fr/backtest')

    # Bordure dorée fine
    c.setStrokeColor(OR3)
    c.setLineWidth(1.5)
    c.roundRect(img_x, img_y, img_w, img_h, 14, fill=0, stroke=1)

    # Caption
    c.setFillColor(GRIS)
    c.setFont('Helvetica-Oblique', 11)
    c.drawString(80, 55, 'Simulation SNTS · 50 000 FCFA/mois · jan 2020 → juin 2025 · Source BRVM officielle · Pas une promesse de rendement')

# ═══════════════════════════════
# SLIDE 6 — CTA UNIQUE
# ═══════════════════════════════
def s6(c):
    bg(c)
    glow(c, W / 2, H / 2, 700, VERT, 0.5)
    grid(c, alpha=0.04)
    slide_num(c, 6)
    brand(c)

    # Logo DI
    c.setFillColor(OR3)
    c.roundRect(W / 2 - 28, 840, 56, 56, 8, fill=1, stroke=0)
    c.setFillColor(VERT)
    c.setFont('Helvetica-Bold', 18)
    c.drawCentredString(W / 2, 862, 'DI')

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(W / 2, 820, 'D  I  A  S  P  O  I  N  V  E  S  T')

    # Titre
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 58)
    c.drawCentredString(W / 2, 720, 'Pret a investir')
    c.drawCentredString(W / 2, 648, 'sur la BRVM ?')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 22)
    c.drawCentredString(W / 2, 590, "J'ai ecrit le guide complet. De l'ouverture du compte")
    c.drawCentredString(W / 2, 560, "jusqu'a ton premier ordre. Donnees reelles. Etapes concretes.")

    # CTA bouton principal
    bw = 600; bh = 72; cx = W / 2
    c.setFillColor(OR3)
    c.roundRect(cx - bw / 2, 450, bw, bh, bh / 2, fill=1, stroke=0)
    c.setFillColor(VERT)
    c.setFont('Helvetica-Bold', 19)
    c.drawCentredString(cx, 484, 'Guide disponible sur  diaspoinvest.fr')
    c.linkURL('https://diaspoinvest.fr', (cx - bw / 2, 450, cx + bw / 2, 450 + bh), relative=0)

    # Newsletter
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawCentredString(cx, 408, 'Newsletter gratuite chaque lundi  —  diaspoinvest.fr')

    # Separateur
    c.setStrokeColor(VERT3)
    c.setLineWidth(1)
    c.line(200, 375, W - 200, 375)

    # Phrase signature
    c.setFillColor(OR)
    c.setFillAlpha(0.6)
    c.setFont('Helvetica-BoldOblique', 17)
    c.drawCentredString(cx, 330,
        u'"Ces chiffres ne vont pas changer parce que tu n\'as pas encore ouvert ton compte."')
    c.setFillAlpha(1)

    # Jordan
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 14)
    c.drawCentredString(cx, 290, 'Jordan · DiaspoInvest · contact@diaspoinvest.fr')

    # Separateur
    c.setStrokeColor(VERT3)
    c.setLineWidth(0.5)
    c.line(200, 260, W - 200, 260)

    # Disclaimer
    c.setFillColor(GRIS)
    c.setFillAlpha(0.45)
    c.setFont('Helvetica', 11)
    c.drawCentredString(cx, 220,
        'Contenu educatif. Non affilie a la BRVM, au CREPMF ni a aucune SGI.')
    c.drawCentredString(cx, 200,
        'Ne constitue pas un conseil en investissement. Performances passees ne prejugent pas des performances futures.')
    c.setFillAlpha(1)


# ═══ GÉNÉRATION ═══
if __name__ == '__main__':
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    cv = canvas.Canvas(OUT, pagesize=(W, H))
    cv.setPageSize((W, H))

    s1(cv); new_slide(cv)
    s2(cv); new_slide(cv)
    s3(cv); new_slide(cv)
    s4(cv); new_slide(cv)
    s5(cv); new_slide(cv)
    s6(cv)

    cv.save()
    print(f"PDF genere : {OUT}")
    print(f"Taille : {os.path.getsize(OUT) // 1024} KB")
    print("6 slides 1080x1080")
