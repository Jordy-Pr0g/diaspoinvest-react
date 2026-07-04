# -*- coding: utf-8 -*-
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
import os

OUT  = r"C:\Users\DJIOKAP JORDAN\Downloads\DiaspoInvest_Carrousel_S2_SGI_v2.pdf"
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
VERT_HL = HexColor('#4CAF7D')
ROUGE   = HexColor('#E05252')
BLEU    = HexColor('#4A90D9')

W = H = 1080

def new_slide(c):
    c.showPage()
    c.setPageSize((W, H))

def bg(c, color):
    c.setFillColor(color)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def glow(c, cx, cy, r, color, alpha=0.3):
    steps = 10
    for i in range(steps, 0, -1):
        ratio = i / steps
        c.setFillColor(color)
        c.setFillAlpha(alpha * ratio / steps * 2)
        c.circle(cx, cy, r * ratio, fill=1, stroke=0)
    c.setFillAlpha(1)

def grid(c, spacing=50, alpha=0.06):
    c.saveState()
    c.setStrokeColor(HexColor('#1A6B4A'))
    c.setStrokeAlpha(alpha)
    c.setLineWidth(0.5)
    for x in range(0, W+spacing, spacing):
        c.line(x, 0, x, H)
    for y in range(0, H+spacing, spacing):
        c.line(0, y, W, y)
    c.restoreState()

def brand(c):
    # Logo réel — 320x186px, ratio 1.72:1, rendu à 83x48px en bas à gauche
    c.drawImage(LOGO, 40, 18, width=83, height=48, mask='auto')
    c.setFillAlpha(1)

def slide_num(c, n, total=7):
    c.setFillColor(OR)
    c.setFillAlpha(0.45)
    c.setFont('Helvetica-Bold', 12)
    c.drawRightString(W-44, H-48, f'{n} / {total}')
    c.setFillAlpha(1)

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

def step_circle(c, x, y, r, num, done=False):
    col = VERT_HL if done else OR
    c.setFillColor(col)
    c.circle(x, y, r, fill=1, stroke=0)
    c.setFillColor(VERT if done else VERT)
    c.setFont('Helvetica-Bold', r)
    c.drawCentredString(x, y - r*0.35, str(num) if not done else '✓')

# ═══════════════════════════════
# SLIDE 1 — HOOK
# ═══════════════════════════════
def s1(c):
    bg(c, FOND)
    glow(c, W-150, H-100, 600, VERT, 0.4)
    grid(c)
    slide_num(c, 1)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 13)
    c.drawString(88, 700, 'OUVRIR UN COMPTE SGI DEPUIS LA DIASPORA')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 82)
    c.drawString(80, 560, 'Depuis Paris,')
    c.drawString(80, 460, 'tu n\'as pas')
    c.drawString(80, 360, 'besoin d\'aller')
    c.setFillColor(OR2)
    c.drawString(80, 255, 'à Abidjan.')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 20)
    c.drawString(80, 200, 'J\'ai ouvert mon compte par email depuis mon appartement à Paris.')
    c.drawString(80, 172, 'Voici exactement comment — en 5 étapes.')

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 110, '→  SWIPE POUR LA PROCÉDURE COMPLÈTE')

# ═══════════════════════════════
# SLIDE 2 — CE QU'EST UNE SGI
# ═══════════════════════════════
def s2(c):
    bg(c, FOND)
    slide_num(c, 2)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'C\'EST QUOI UNE SGI ?')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 38)
    c.drawString(80, H-160, 'Ton intermédiaire obligatoire')
    c.drawString(80, H-210, 'pour acheter des actions BRVM.')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 18)
    c.drawString(80, H-280, 'Sans SGI agréée CREPMF, il est impossible d\'acheter')
    c.drawString(80, H-306, 'ou vendre des actions sur la BRVM. C\'est la loi.')

    # Schéma circuit
    items = ['Toi\n(Paris)', 'SGI\n(Abidjan)', 'BRVM', 'Action\nBRVM', 'Dividende']
    colors = [BLEU, VERT, HexColor('#1A5A3A'), VERT, OR]
    bw = 168; bh = 90; gap = 18
    total = len(items) * bw + (len(items)-1)*gap
    x0 = (W - total) / 2
    y0 = 390

    for i, (label, col) in enumerate(zip(items, colors)):
        x = x0 + i*(bw+gap)
        c.setFillColor(col)
        c.roundRect(x, y0, bw, bh, 10, fill=1, stroke=0)
        c.setFillColor(BLANC)
        lines = label.split('\n')
        c.setFont('Helvetica-Bold', 16)
        if len(lines) == 2:
            c.drawCentredString(x+bw/2, y0+bh/2+4, lines[0])
            c.setFont('Helvetica', 13)
            c.drawCentredString(x+bw/2, y0+bh/2-14, lines[1])
        else:
            c.drawCentredString(x+bw/2, y0+bh/2-6, label)
        if i < len(items)-1:
            ax = x + bw + 4; ay = y0 + bh/2
            c.setStrokeColor(OR)
            c.setLineWidth(2)
            c.line(ax, ay, ax+gap-8, ay)
            c.setFillColor(OR)
            p = c.beginPath()
            p.moveTo(ax+gap-8, ay); p.lineTo(ax+gap-16, ay+5); p.lineTo(ax+gap-16, ay-5); p.close()
            c.drawPath(p, fill=1, stroke=0)

    # Différence broker européen
    card(c, 60, 220, W-120, 140, VERT2, VERT3, left_bar=True)
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(80, 334, 'Degiro, Boursorama, Trade Republic')
    c.setFillColor(ROUGE)
    c.drawString(80, 308, '✗  Pas d\'accès à la BRVM — réservé aux SGI agréées CREPMF')
    c.setFillColor(VERT_HL)
    c.drawString(80, 280, '✓  BOA Capital, BNI Securities, Bridge Securities — accès BRVM')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 13)
    c.drawString(80, 250, 'Vérifie toujours la liste officielle sur crepmf.org avant d\'ouvrir un compte.')

# ═══════════════════════════════
# SLIDE 3 — QUELLE SGI CHOISIR
# ═══════════════════════════════
def s3(c):
    bg(c, FOND)
    slide_num(c, 3)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'ÉTAPE 1 — CHOISIR SA SGI')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 36)
    c.drawString(80, H-152, 'Les SGI accessibles depuis la France')

    sgis = [
        ('BOA Capital Securities', 'Côte d\'Ivoire', 'Oui', '~762 EUR', OR2),
        ('BNI Securities',         'Côte d\'Ivoire', 'Oui', '~152 EUR', VERT_HL),
        ('Bridge Securities',      'Côte d\'Ivoire', 'Oui', '~381 EUR', VERT_HL),
        ('Africabourse',           'CI / Bénin / Togo','Oui', '~152 EUR', VERT_HL),
        ('BSIC Capital',           'Multinational',  'Partiel','~762 EUR', OR),
    ]
    headers = ['SGI', 'Pays', 'Distance', 'Dépôt min.']
    col_w = [310, 200, 130, 160]
    hx = [80, 390, 590, 720]
    hy = H - 220

    # Header
    c.setFillColor(VERT)
    c.roundRect(60, hy-10, W-120, 44, 6, fill=1, stroke=0)
    for j, (h_txt, x) in enumerate(zip(headers, hx)):
        c.setFillColor(OR)
        c.setFont('Helvetica-Bold', 12)
        c.drawString(x, hy+6, h_txt)

    # Rows
    for i, (name, pays, dist, depot, col) in enumerate(sgis):
        ry = hy - 60 - i*74
        bg_row = VERT2 if i % 2 == 0 else HexColor('#0C1A10')
        c.setFillColor(bg_row)
        c.roundRect(60, ry-10, W-120, 64, 6, fill=1, stroke=0)
        vals = [name, pays, dist, depot]
        for j, (val, x) in enumerate(zip(vals, hx)):
            c.setFillColor(col if j == 0 else BLANC if j < 3 else GRIS)
            c.setFont('Helvetica-Bold' if j == 0 else 'Helvetica', 14 if j == 0 else 13)
            c.drawString(x, ry+12, val)

    c.setFillColor(GRIS)
    c.setFillAlpha(0.5)
    c.setFont('Helvetica-Oblique', 11)
    c.drawString(80, 80, 'Liste indicative · Vérifie toujours sur crepmf.org · Dépôts indicatifs — contacte directement la SGI')
    c.setFillAlpha(1)

# ═══════════════════════════════
# SLIDE 4 — DOCUMENTS
# ═══════════════════════════════
def s4(c):
    bg(c, FOND)
    slide_num(c, 4)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'ÉTAPE 2 — PRÉPARER SES DOCUMENTS')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 36)
    c.drawString(80, H-152, 'Ce qu\'il faut avoir avant d\'écrire à la SGI')

    docs = [
        ('01', 'CNI ou Passeport',      'Recto-verso · Scan couleur lisible · En cours de validité',         OR2),
        ('02', 'Justif. de domicile',   'Moins de 3 mois · Quittance EDF, facture télécom ou avis imposition', VERT_HL),
        ('03', 'RIB européen',          'Ton compte bancaire français · Pour les virements entrants et sortants', VERT_HL),
        ('04', 'Formulaire SGI',        'Fourni par la SGI par email · À remplir, signer et scanner',          OR),
    ]
    ch = 150; gap = 16; y0 = 100

    for i, (num, title, desc, col) in enumerate(docs):
        y = y0 + (3-i)*(ch+gap)
        card(c, 60, y, W-120, ch, VERT2, VERT3)
        # Numéro cercle
        c.setFillColor(col)
        c.circle(116, y+ch/2, 32, fill=1, stroke=0)
        c.setFillColor(VERT)
        c.setFont('Helvetica-Bold', 16)
        c.drawCentredString(116, y+ch/2-6, num)
        # Texte
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 20)
        c.drawString(172, y+ch/2+10, title)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 14)
        c.drawString(172, y+ch/2-14, desc)

# ═══════════════════════════════
# SLIDE 5 — ENVOI + VIREMENT
# ═══════════════════════════════
def s5(c):
    bg(c, FOND)
    slide_num(c, 5)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'ÉTAPES 3 ET 4 — ENVOYER ET VIRER')

    # Étape 3 — Envoi dossier
    card(c, 60, 530, W-120, 280, VERT2, VERT3, left_bar=True)
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(82, 782, 'ÉTAPE 3 — ENVOYER TON DOSSIER')
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 22)
    c.drawString(82, 750, 'Par email à la SGI — objet : "Ouverture compte non-résident"')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 16)
    c.drawString(82, 718, 'Joins tes 4 documents scannés en PDF ou JPEG.')
    c.drawString(82, 694, 'Note la date d\'envoi. La SGI répond en général sous 48 à 72h.')
    c.drawString(82, 670, 'Délai de validation KYC : 7 à 15 jours ouvrables.')
    c.setFillColor(VERT_HL)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(82, 640, '→ Exemple BOA Capital : boacapital@bank-of-africa.net')

    # Étape 4 — Virement
    card(c, 60, 200, W-120, 300, VERT2, VERT3, left_bar=True)
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 14)
    c.drawString(82, 468, 'ÉTAPE 4 — VIRER TES FONDS VIA WISE')

    comparaison = [
        ('Ta banque classique', '2% - 3%',    '3-5 jours', ROUGE),
        ('Wise / Revolut',      '0,3% - 0,5%','1-3 jours', VERT_HL),
    ]
    for i, (label, frais, delai, col) in enumerate(comparaison):
        cx = 200 + i * 420
        cy = 330
        c.setFillColor(VERT if i == 0 else HexColor('#0A2218'))
        c.roundRect(cx-160, cy-60, 320, 120, 10, fill=1, stroke=0)
        if i == 1:
            c.setStrokeColor(VERT_HL)
            c.setLineWidth(1.5)
            c.roundRect(cx-160, cy-60, 320, 120, 10, fill=0, stroke=1)
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 16)
        c.drawCentredString(cx, cy+30, label)
        c.setFillColor(BLANC)
        c.setFont('Helvetica-Bold', 22)
        # val drawn below
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 14)
        c.drawCentredString(cx, cy-24, delai)
        c.setFont('Helvetica-Bold', 22)
        c.setFillColor(col)
        c.drawCentredString(cx, cy, frais)

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 15)
    c.drawString(82, 230, 'Sur 500 EUR : Wise te fait économiser ~12 EUR vs ta banque. Multiplie par 12 mois.')

# ═══════════════════════════════
# SLIDE 6 — PREMIER ORDRE
# ═══════════════════════════════
def s6(c):
    bg(c, FOND)
    slide_num(c, 6)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'ÉTAPE 5 — PASSER TON PREMIER ORDRE')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 36)
    c.drawString(80, H-152, 'Ton compte est activé. Les fonds sont arrivés.')
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 36)
    c.drawString(80, H-200, 'Voici comment j\'achète Sonatel (SNTS).')

    steps = [
        ('1', 'Connecte-toi',        'Espace client SGI — site web ou app mobile'),
        ('2', 'Recherche SNTS',      'Tape le code valeur dans la barre de recherche'),
        ('3', 'Clique "Acheter"',    'La fiche action s\'affiche avec le cours en temps réel'),
        ('4', 'Cours limité',        'Sélectionne "Ordre à cours limité" — entre 28 400 FCFA'),
        ('5', 'Quantité et valide',  'Indique la quantité · Vérifie les frais · Valide'),
        ('6', 'Confirmation',        'La SGI transmet à la BRVM · Confirmation par email'),
    ]
    ch = 102; gap = 10; y0 = 92

    for i, (num, title, desc) in enumerate(steps):
        y = y0 + (5-i)*(ch+gap)
        col = OR if i == 3 else VERT_HL if i == 5 else VERT_HL
        card(c, 60, y, W-120, ch, VERT2, VERT3)
        c.setFillColor(col)
        c.circle(110, y+ch/2, 24, fill=1, stroke=0)
        c.setFillColor(VERT)
        c.setFont('Helvetica-Bold', 13)
        c.drawCentredString(110, y+ch/2-5, num)
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 18)
        c.drawString(152, y+ch/2+6, title)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 14)
        c.drawString(152, y+ch/2-16, desc)

# ═══════════════════════════════
# SLIDE 7 — TIMELINE + CTA
# ═══════════════════════════════
def s7(c):
    bg(c, FOND)
    glow(c, W/2, 400, 500, VERT, 0.35)
    slide_num(c, 7)
    brand(c)

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(80, H-80, 'TON PLAN 30 JOURS — DE ZÉRO AU PREMIER ORDRE')

    # Timeline
    jalons = [
        ('J0',  'Email à\nla SGI'),
        ('J3',  'Dossier\nenvoyé'),
        ('J10', 'Compte\nvalidé'),
        ('J14', 'Virement\nWise'),
        ('J18', 'Fonds\ndisponibles'),
        ('J30', 'Premier\nordre ✓'),
    ]
    n = len(jalons)
    x0 = 100; x1 = W-100; y_line = 620
    dx = (x1-x0)/(n-1)

    c.setStrokeColor(VERT3)
    c.setLineWidth(3)
    c.line(x0, y_line, x1, y_line)

    for i, (jour, label) in enumerate(jalons):
        x = x0 + i*dx
        col = OR if i == n-1 else VERT_HL
        c.setFillColor(col)
        c.circle(x, y_line, 22, fill=1, stroke=0)
        c.setFillColor(VERT)
        c.setFont('Helvetica-Bold', 11)
        c.drawCentredString(x, y_line-4, jour)
        lines = label.split('\n')
        c.setFillColor(BLANC if i < n-1 else OR2)
        c.setFont('Helvetica-Bold', 13)
        if i % 2 == 0:
            for j, l in enumerate(lines):
                c.drawCentredString(x, y_line+44+j*18, l)
        else:
            for j, l in enumerate(lines):
                c.drawCentredString(x, y_line-54-j*18, l)

    # CTA
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 28)
    c.drawCentredString(W/2, 450, 'En 30 jours, ton premier ordre est passé.')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 18)
    c.drawCentredString(W/2, 414, 'Sans aller à Abidjan. Sans expertise financière préalable.')

    # Boutons
    bw = 500; bh = 60
    cx = W/2
    c.setFillColor(OR3)
    c.roundRect(cx-bw/2, 300, bw, bh, bh/2, fill=1, stroke=0)
    c.setFillColor(VERT)
    c.setFont('Helvetica-Bold', 17)
    c.drawCentredString(cx, 328, 'Guide complet sur diaspoinvest.fr — 14,99 EUR')
    c.linkURL('https://diaspoinvest.fr', (cx-bw/2, 300, cx+bw/2, 300+bh), relative=0)

    c.setStrokeColor(OR)
    c.setLineWidth(1.5)
    c.roundRect(cx-bw/2, 224, bw, bh, bh/2, fill=0, stroke=1)
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 15)
    c.drawCentredString(cx, 252, 'Newsletter gratuite chaque lundi — diaspoinvest.fr')
    c.linkURL('https://diaspoinvest.fr', (cx-bw/2, 224, cx+bw/2, 224+bh), relative=0)

    c.setFillColor(OR)
    c.setFillAlpha(0.4)
    c.setFont('Helvetica-BoldOblique', 14)
    c.drawCentredString(cx, 170, '"Ces chiffres ne vont pas changer parce que tu n\'as pas encore ouvert ton compte."')
    c.setFillAlpha(1)

    c.setFillColor(OR3)
    c.roundRect(cx-14, 108, 28, 28, 5, fill=1, stroke=0)
    c.setFillColor(VERT)
    c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(cx, 119, 'DI')
    c.setFillColor(OR)
    c.setFillAlpha(0.6)
    c.setFont('Helvetica', 11)
    c.drawCentredString(cx, 92, 'DiaspoInvest · contact@diaspoinvest.fr · diaspoinvest.fr')
    c.linkURL('https://diaspoinvest.fr', (cx-200, 82, cx+200, 102), relative=0)
    c.setFillAlpha(1)

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

print(f"PDF généré : {OUT}")
print(f"Taille : {os.path.getsize(OUT)//1024} KB")
print("7 slides 1080x1080")
