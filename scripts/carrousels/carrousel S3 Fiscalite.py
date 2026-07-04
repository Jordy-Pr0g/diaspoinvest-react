# -*- coding: utf-8 -*-
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
import os

OUT  = r"C:\Users\DJIOKAP JORDAN\Downloads\DiaspoInvest_Carrousel_S3_Fiscalite.pdf"
LOGO = r"C:\Users\DJIOKAP JORDAN\Downloads\logo-horizontal-transparent.png"

FOND  = HexColor('#060E09')
VERT  = HexColor('#0D3B2E')
VERT2 = HexColor('#0A1E12')
VERT3 = HexColor('#1A3A28')
OR    = HexColor('#D4AF37')
OR2   = HexColor('#F5D67A')
OR3   = HexColor('#C9A830')
GRIS  = HexColor('#AAAAAA')
BLANC = white
VHL   = HexColor('#4CAF7D')
ROUGE = HexColor('#E05252')
BLEU  = HexColor('#4A90D9')
PURP  = HexColor('#C084FC')

W = H = 1080

def new_slide(c): c.showPage(); c.setPageSize((W, H))

def bg(c, color):
    c.setFillColor(color); c.rect(0, 0, W, H, fill=1, stroke=0)

def glow(c, cx, cy, r, col, a=0.3):
    for i in range(10, 0, -1):
        c.setFillColor(col); c.setFillAlpha(a*i/10/5)
        c.circle(cx, cy, r*i/10, fill=1, stroke=0)
    c.setFillAlpha(1)

def grid(c):
    c.saveState(); c.setStrokeColor(HexColor('#1A6B4A')); c.setStrokeAlpha(0.06)
    c.setLineWidth(0.5)
    for x in range(0, W+50, 50): c.line(x, 0, x, H)
    for y in range(0, H+50, 50): c.line(0, y, W, y)
    c.restoreState()

def brand(c):
    c.drawImage(LOGO, 40, 18, width=83, height=48, mask='auto')

def snum(c, n, total=7):
    c.setFillColor(OR); c.setFillAlpha(0.45); c.setFont('Helvetica-Bold', 12)
    c.drawRightString(W-44, H-48, f'{n} / {total}'); c.setFillAlpha(1)

def card(c, x, y, w, h, bg_c, brd=None, lbar=False):
    c.setFillColor(bg_c); c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    if brd: c.setStrokeColor(brd); c.setLineWidth(1); c.roundRect(x, y, w, h, 12, fill=0, stroke=1)
    if lbar: c.setFillColor(OR); c.roundRect(x, y, 5, h, 2, fill=1, stroke=0)

def cta_buttons(c, url1, label1, url2, label2):
    cx = W/2; bw = 520; bh = 60
    c.setFillColor(OR3)
    c.roundRect(cx-bw/2, 300, bw, bh, bh/2, fill=1, stroke=0)
    c.setFillColor(VERT); c.setFont('Helvetica-Bold', 17)
    c.drawCentredString(cx, 328, label1)
    c.linkURL(url1, (cx-bw/2, 300, cx+bw/2, 360), relative=0)

    c.setStrokeColor(OR); c.setLineWidth(1.5)
    c.roundRect(cx-bw/2, 224, bw, bh, bh/2, fill=0, stroke=1)
    c.setFillColor(OR); c.setFont('Helvetica-Bold', 15)
    c.drawCentredString(cx, 252, label2)
    c.linkURL(url2, (cx-bw/2, 224, cx+bw/2, 284), relative=0)

    c.setFillColor(OR); c.setFillAlpha(0.4); c.setFont('Helvetica-BoldOblique', 14)
    c.drawCentredString(cx, 170, '"Ces chiffres ne vont pas changer parce que tu n\'as pas encore ouvert ton compte."')
    c.setFillAlpha(1)

    c.setFillColor(OR3); c.roundRect(cx-14, 110, 28, 28, 5, fill=1, stroke=0)
    c.setFillColor(VERT); c.setFont('Helvetica-Bold', 9); c.drawCentredString(cx, 121, 'DI')
    c.setFillColor(OR); c.setFillAlpha(0.6); c.setFont('Helvetica', 11)
    c.drawCentredString(cx, 94, 'DiaspoInvest · contact@diaspoinvest.fr · diaspoinvest.fr')
    c.linkURL('https://diaspoinvest.fr', (cx-220, 84, cx+220, 104), relative=0)
    c.setFillAlpha(1)

# ═══ S1 — HOOK ═══
def s1(c):
    bg(c, FOND); glow(c, W-100, H, 700, VERT, 0.4); grid(c)
    snum(c, 1); brand(c)

    c.setFillColor(OR); c.setFont('Helvetica-Bold', 13)
    c.drawString(88, 710, 'FISCALITÉ BRVM SELON TON PAYS')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 76)
    c.drawString(80, 570, 'Même action.')
    c.drawString(80, 476, 'Même dividende.')
    c.setFillColor(OR2); c.setFont('Helvetica-Bold', 76)
    c.drawString(80, 382, 'Pas le même net.')

    c.setFillColor(GRIS); c.setFont('Helvetica', 20)
    c.drawString(80, 314, 'Sonatel verse 6,13% à tout le monde.')
    c.drawString(80, 286, 'Mais ce que tu touches dépend d\'où tu vis.')

    # Mini comparaison
    card(c, 80, 140, 420, 120, VERT2, VERT3, lbar=True)
    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 14)
    c.drawString(100, 230, 'Résident France'); c.setFillColor(ROUGE)
    c.setFont('Helvetica-Bold', 28); c.drawString(100, 196, '4,21% net')
    c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawString(100, 172, 'Flat tax 31,4%')

    card(c, 560, 140, 440, 120, HexColor('#0A2218'), VHL, lbar=False)
    c.setStrokeColor(VHL); c.setLineWidth(1.5)
    c.roundRect(560, 140, 440, 120, 12, fill=0, stroke=1)
    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 14)
    c.drawString(580, 230, 'Résident Sénégal'); c.setFillColor(VHL)
    c.setFont('Helvetica-Bold', 28); c.drawString(580, 196, '5,52% net')
    c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawString(580, 172, 'IRVM 10% · rien à déclarer')

    c.setFillColor(OR); c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 100, '→  SWIPE POUR LE DÉTAIL PAR PAYS')

# ═══ S2 — PRINCIPE FLAT TAX ═══
def s2(c):
    bg(c, FOND); snum(c, 2); brand(c)

    c.setFillColor(OR); c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'RÉSIDENTS FRANCE — LA FLAT TAX')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 38)
    c.drawString(80, H-158, 'Prélèvement Forfaitaire Unique (PFU)')

    # Calcul visuel flat tax
    card(c, 60, 540, W-120, 320, VERT2, VERT3)
    c.setFillColor(OR); c.setFont('Helvetica-Bold', 20)
    c.drawCentredString(W/2, 830, 'COMMENT ÇA SE CALCULE SUR SONATEL')

    parts = [
        ('Rendement brut',    '6,13%',  OR2,   420),
        ('Impôt sur revenu',  '−12,8%', ROUGE, 560),
        ('Prélèv. sociaux',   '−18,6%', ROUGE, 700),
        ('= Net réel France', '4,21%',  VHL,   840),
    ]
    for label, val, col, x in parts:
        c.setFillColor(HexColor('#0C1810') if col != VHL else HexColor('#0A2218'))
        c.roundRect(x-130, 572, 240, 220, 10, fill=1, stroke=0)
        c.setStrokeColor(col); c.setLineWidth(1.5 if col==VHL else 1)
        c.roundRect(x-130, 572, 240, 220, 10, fill=0, stroke=1)
        c.setFillColor(GRIS); c.setFont('Helvetica', 13)
        c.drawCentredString(x, 770, label)
        c.setFillColor(col); c.setFont('Helvetica-Bold', 44)
        c.drawCentredString(x, 700, val)

    # Règles importantes
    rules = [
        ('⚠', 'Formulaire 3916 OBLIGATOIRE', 'Chaque année sur impots.gouv.fr · Amende 1 500 EUR si oublié', ROUGE),
        ('📋', 'BRVM non éligible au PEA', 'Tout passe par un compte-titres ordinaire (CTO)', OR),
        ('💡', 'Dividendes imposables dès le versement', 'Même si tu ne rapatries pas l\'argent en France', BLEU),
    ]
    y0 = 340
    for i, (icon, title, desc, col) in enumerate(rules):
        card(c, 60, y0 - i*130, W-120, 110, VERT2, VERT3, lbar=True)
        c.setFillColor(col); c.setFont('Helvetica-Bold', 18)
        c.drawString(86, y0-i*130+70, f'{icon}  {title}')
        c.setFillColor(GRIS); c.setFont('Helvetica', 14)
        c.drawString(86, y0-i*130+44, desc)

# ═══ S3 — ZONE UEMOA ═══
def s3(c):
    bg(c, VERT); snum(c, 3); brand(c)

    c.setFillColor(OR); c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'RÉSIDENTS UEMOA — L\'AVANTAGE MÉCONNU')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 38)
    c.drawString(80, H-158, 'L\'IRVM prélevé à la source.')
    c.setFillColor(OR2); c.setFont('Helvetica-Bold', 38)
    c.drawString(80, H-210, 'Tu ne déclares rien. Tu reçois le net.')

    # Tableau pays
    pays_data = [
        ('🇨🇮', 'Côte d\'Ivoire', '12%',   '5,39%', 'x 1,5 l\'épargne bancaire'),
        ('🇸🇳', 'Sénégal',        '10%',   '5,52%', 'x 1,6 l\'épargne bancaire'),
        ('🇧🇯', 'Bénin',          '10%',   '5,52%', 'x 1,6 l\'épargne bancaire'),
        ('🇧🇫', 'Burkina Faso',   '12,5%', '5,36%', 'x 1,5 l\'épargne bancaire'),
        ('🇹🇬', 'Togo',           '13%',   '5,33%', 'x 1,5 l\'épargne bancaire'),
    ]
    headers = ['Pays', 'IRVM à la source', 'Net réel Sonatel', 'vs Épargne bancaire 3,5%']
    hx = [90, 340, 560, 750]
    hy = H - 300

    c.setFillColor(HexColor('#0A2218'))
    c.roundRect(60, hy-14, W-120, 48, 6, fill=1, stroke=0)
    c.setStrokeColor(OR); c.setLineWidth(1); c.roundRect(60, hy-14, W-120, 48, 6, fill=0, stroke=1)
    for j, (h_txt, x) in enumerate(zip(headers, hx)):
        c.setFillColor(OR); c.setFont('Helvetica-Bold', 12); c.drawString(x, hy+2, h_txt)

    for i, (flag, pays, irvm, net, vs) in enumerate(pays_data):
        ry = hy - 70 - i*78
        bg_r = HexColor('#0D3B2E') if i % 2 == 0 else HexColor('#0A2A1E')
        c.setFillColor(bg_r); c.roundRect(60, ry-12, W-120, 68, 6, fill=1, stroke=0)
        row_vals = [f'{flag} {pays}', irvm, net, vs]
        row_cols = [BLANC, OR, VHL, VHL]
        row_fonts = ['Helvetica-Bold', 'Helvetica-Bold', 'Helvetica-Bold', 'Helvetica']
        row_sizes = [16, 18, 22, 14]
        for j, (val, col, font, size) in enumerate(zip(row_vals, row_cols, row_fonts, row_sizes)):
            c.setFillColor(col); c.setFont(font, size)
            c.drawString(hx[j], ry+14, val)

    # Plus-value box
    c.setFillColor(HexColor('#0A2A0A'))
    c.roundRect(60, 136, W-120, 84, 10, fill=1, stroke=0)
    c.setStrokeColor(VHL); c.setLineWidth(1.5)
    c.roundRect(60, 136, W-120, 84, 10, fill=0, stroke=1)
    c.setFillColor(VHL); c.setFont('Helvetica-Bold', 20)
    c.drawString(90, 194, '✅  PLUS-VALUES TOTALEMENT EXONÉRÉES EN ZONE UEMOA')
    c.setFillColor(GRIS); c.setFont('Helvetica', 15)
    c.drawString(90, 164, 'Tu vends avec un gain → tu gardes 100%. Zéro impôt. Avantage que les résidents France n\'ont pas.')

# ═══ S4 — COMPARATIF VISUEL ═══
def s4(c):
    bg(c, FOND); snum(c, 4); brand(c)

    c.setFillColor(OR); c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'COMPARATIF — MÊME ACTION, RÉSULTATS DIFFÉRENTS')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 34)
    c.drawString(80, H-152, '100 actions Sonatel · Dividende brut : 174 000 FCFA')

    profiles = [
        ('🇫🇷 France',      '31,4%', '54 636', '119 364', '4,21%', ROUGE,  False),
        ('🇨🇮 Côte d\'Ivoire','12%', '20 880', '153 120', '5,39%', OR,     True),
        ('🇸🇳 Sénégal',     '10%',  '17 400', '156 600', '5,52%', VHL,    True),
        ('🇧🇯 Bénin',       '10%',  '17 400', '156 600', '5,52%', VHL,    True),
    ]
    cw = 218; ch = 440; gap = 16
    total_w = 4*cw + 3*gap
    x0 = (W - total_w) / 2
    y0 = 160

    for i, (label, taux, impot, net_val, rend, col, hl) in enumerate(profiles):
        x = x0 + i*(cw+gap)
        bg_c = HexColor('#1A1200') if hl and col==VHL else HexColor('#1A0A0A') if col==ROUGE else HexColor('#1A1000')
        card(c, x, y0, cw, ch, bg_c)
        if hl:
            c.setStrokeColor(col); c.setLineWidth(1.5)
            c.roundRect(x, y0, cw, ch, 12, fill=0, stroke=1)
        # Top bar
        c.setFillColor(col); c.roundRect(x, y0+ch-6, cw, 6, 2, fill=1, stroke=0)
        # Label
        c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 15)
        c.drawCentredString(x+cw/2, y0+ch-34, label)
        # Taux
        c.setFillColor(GRIS); c.setFont('Helvetica', 12)
        c.drawCentredString(x+cw/2, y0+ch-56, f'Impôt : {taux}')
        # Séparateur
        c.setStrokeColor(VERT3); c.setLineWidth(0.5)
        c.line(x+16, y0+ch-68, x+cw-16, y0+ch-68)
        # Impôt
        c.setFillColor(GRIS); c.setFont('Helvetica', 12)
        c.drawCentredString(x+cw/2, y0+300, 'Impôt prélevé')
        c.setFillColor(ROUGE if col==ROUGE else HexColor('#885544'))
        c.setFont('Helvetica-Bold', 22)
        c.drawCentredString(x+cw/2, y0+272, f'- {impot}')
        c.setFillColor(GRIS); c.setFont('Helvetica', 11)
        c.drawCentredString(x+cw/2, y0+250, 'FCFA')
        # Net
        c.setFillColor(GRIS); c.setFont('Helvetica', 12)
        c.drawCentredString(x+cw/2, y0+200, 'Net reçu')
        c.setFillColor(col); c.setFont('Helvetica-Bold', 26)
        c.drawCentredString(x+cw/2, y0+168, net_val)
        c.setFillColor(GRIS); c.setFont('Helvetica', 11)
        c.drawCentredString(x+cw/2, y0+146, 'FCFA')
        # Rendement
        c.setFillColor(GRIS); c.setFont('Helvetica', 12)
        c.drawCentredString(x+cw/2, y0+100, 'Rendement net')
        c.setFillColor(col); c.setFont('Helvetica-Bold', 36)
        c.drawCentredString(x+cw/2, y0+56, rend)

# ═══ S5 — FORMULAIRE 3916 ═══
def s5(c):
    bg(c, FOND); snum(c, 5); brand(c)

    c.setFillColor(ROUGE); c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, '⚠  RÉSIDENTS FRANCE — FORMULAIRE 3916 OBLIGATOIRE')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 40)
    c.drawString(80, H-170, 'Ne jamais oublier.')
    c.setFillColor(OR2); c.setFont('Helvetica-Bold', 40)
    c.drawString(80, H-224, 'Amende : 1 500 EUR par an.')

    # Explication
    card(c, 60, 560, W-120, 240, VERT2, VERT3, lbar=True)
    c.setFillColor(OR); c.setFont('Helvetica-Bold', 18)
    c.drawString(82, 770, 'QU\'EST-CE QUE LE FORMULAIRE 3916 ?')
    c.setFillColor(BLANC); c.setFont('Helvetica', 16)
    c.drawString(82, 738, 'Tout résident fiscal français avec un compte ouvert à l\'étranger')
    c.drawString(82, 712, '(y compris un compte SGI BRVM) doit le déclarer chaque année')
    c.drawString(82, 686, 'sur impots.gouv.fr — section "Comptes à l\'étranger".')
    c.setFillColor(ROUGE); c.setFont('Helvetica-Bold', 16)
    c.drawString(82, 652, 'Amende : 1 500 EUR par compte non déclaré, par an.')

    # Steps
    steps_3916 = [
        ('1', 'Va sur impots.gouv.fr lors de ta déclaration annuelle'),
        ('2', 'Section "Comptes à l\'étranger" — formulaire 3916'),
        ('3', 'Entre : nom SGI, pays, numéro de compte, date d\'ouverture'),
        ('4', 'Valide — 5 minutes. À faire chaque année.'),
    ]
    for i, (num, text) in enumerate(steps_3916):
        y = 500 - i*110
        card(c, 60, y, W-120, 90, VERT2, VERT3)
        c.setFillColor(ROUGE); c.circle(106, y+45, 22, fill=1, stroke=0)
        c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 14); c.drawCentredString(106, y+39, num)
        c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 16); c.drawString(148, y+52, text[:60])
        if len(text) > 60:
            c.setFillColor(GRIS); c.setFont('Helvetica', 14); c.drawString(148, y+28, text[60:])

# ═══ S6 — SIMULATION NETTE ═══
def s6(c):
    bg(c, FOND); snum(c, 6); brand(c)

    c.setFillColor(OR); c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'SIMULATION — CE QUE TU TOUCHES VRAIMENT')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 34)
    c.drawString(80, H-152, 'DCA Sonatel · 50 000 FCFA/mois · 10 ans')
    c.setFillColor(GRIS); c.setFont('Helvetica', 18)
    c.drawString(80, H-198, 'Dividendes bruts annuels estimés : 363 660 FCFA'  )

    profiles_sim = [
        ('🇫🇷 France',        '363 660', '31,4%', '249 471', '4,21%', ROUGE),
        ('🇨🇮 Côte d\'Ivoire', '363 660', '12%',   '320 021', '5,39%', OR),
        ('🇸🇳 Sénégal',       '363 660', '10%',   '327 294', '5,52%', VHL),
        ('🇧🇯 Bénin',         '363 660', '10%',   '327 294', '5,52%', VHL),
    ]
    cw = 218; ch = 500; gap = 16
    total_w = 4*cw + 3*gap
    x0 = (W - total_w) / 2
    y0 = 100

    for i, (label, brut, taux, net, rend, col) in enumerate(profiles_sim):
        x = x0 + i*(cw+gap)
        card(c, x, y0, cw, ch, VERT2, VERT3)
        c.setFillColor(col); c.roundRect(x, y0+ch-6, cw, 6, 2, fill=1, stroke=0)
        c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 14)
        c.drawCentredString(x+cw/2, y0+ch-34, label)
        c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawCentredString(x+cw/2, y0+ch-56, 'Brut annuel')
        c.setFillColor(OR2); c.setFont('Helvetica-Bold', 20); c.drawCentredString(x+cw/2, y0+ch-82, brut)
        c.setFillColor(GRIS); c.setFont('Helvetica', 11); c.drawCentredString(x+cw/2, y0+ch-100, 'FCFA')
        c.setStrokeColor(VERT3); c.line(x+16, y0+ch-112, x+cw-16, y0+ch-112)
        c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawCentredString(x+cw/2, y0+330, f'Impôt ({taux})')
        impot_v = int(float(brut.replace(' ','')) - float(net.replace(' ','')))
        c.setFillColor(ROUGE); c.setFont('Helvetica-Bold', 18); c.drawCentredString(x+cw/2, y0+300, f'- {impot_v:,}'.replace(',', ' '))
        c.setFillColor(GRIS); c.setFont('Helvetica', 10); c.drawCentredString(x+cw/2, y0+280, 'FCFA')
        c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawCentredString(x+cw/2, y0+230, 'Net reçu / an')
        c.setFillColor(col); c.setFont('Helvetica-Bold', 28); c.drawCentredString(x+cw/2, y0+192, net)
        c.setFillColor(GRIS); c.setFont('Helvetica', 11); c.drawCentredString(x+cw/2, y0+170, 'FCFA par an')
        c.setFillColor(col); c.setFont('Helvetica-Bold', 40); c.drawCentredString(x+cw/2, y0+100, rend)
        c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawCentredString(x+cw/2, y0+70, 'rendement net')

# ═══ S7 — CTA ═══
def s7(c):
    bg(c, FOND); glow(c, W/2, 400, 500, VERT, 0.35)
    snum(c, 7)

    cx = W/2
    c.setFillColor(OR3); c.roundRect(cx-36, 820, 72, 72, 14, fill=1, stroke=0)
    c.setFillColor(VERT); c.setFont('Helvetica-Bold', 28); c.drawCentredString(cx, 845, 'DI')
    c.setFillColor(OR); c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(cx, 796, 'D I A S P O I N V E S T')

    c.setFillColor(BLANC); c.setFont('Helvetica-Bold', 58)
    c.drawCentredString(cx, 700, 'Tu connais maintenant')
    c.drawCentredString(cx, 630, 'ta fiscalité BRVM.')
    c.setFillColor(OR2); c.setFont('Helvetica-Bold', 58)
    c.drawCentredString(cx, 550, 'Il ne reste qu\'à agir.')

    c.setFillColor(GRIS); c.setFont('Helvetica', 18)
    c.drawCentredString(cx, 490, 'Le guide couvre la fiscalité pays par pays.')
    c.drawCentredString(cx, 462, 'Le Tracker calcule ton net réel automatiquement.')

    cta_buttons(c,
        'https://diaspoinvest.fr', 'Guide + Tracker sur diaspoinvest.fr',
        'https://diaspoinvest.fr', 'Newsletter gratuite chaque lundi')

# ═══ GÉNÉRATION ═══
c = canvas.Canvas(OUT, pagesize=(W, H))
s1(c); new_slide(c)
s2(c); new_slide(c)
s3(c); new_slide(c)
s4(c); new_slide(c)
s5(c); new_slide(c)
s6(c); new_slide(c)
s7(c)
c.save()
print(f"PDF : {OUT} · {os.path.getsize(OUT)//1024} KB · 7 slides")
