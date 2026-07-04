# -*- coding: utf-8 -*-
"""
Carrousel S1 BRVM v3 — Refonte complete
Cible  : diaspora qui met son epargne au Livret A
Objectif: clic vers diaspoinvest.fr
Regle  : 1 idee par slide · chiffres enormes · zero screenshot · zero decor inutile
Slides : 1 Hook · 2 Probleme · 3 Preuve · 4 Impact · 5 Mecanisme · 6 CTA
"""
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, black
import os

OUT  = r"C:\Users\DJIOKAP JORDAN\DiaspoInvest\content\carrousels\DiaspoInvest Carrousel LinkedIn BRVM.pdf"
LOGO = r"C:\Users\DJIOKAP JORDAN\DiaspoInvest\branding\logo-horizontal-transparent.png"

# Palette
FOND    = HexColor('#060E09')
VERT    = HexColor('#0D3B2E')
VERT2   = HexColor('#0A1E12')
VERT3   = HexColor('#1A3A28')
OR      = HexColor('#D4AF37')
OR2     = HexColor('#F5D67A')
OR3     = HexColor('#C9A830')
GRIS    = HexColor('#9A9A9A')
GRIS2   = HexColor('#666666')
BLANC   = white
ROUGE   = HexColor('#E05252')
VERT_HL = HexColor('#4CAF7D')

W = H = 1080


# ──────────────────────────────
# UTILITAIRES
# ──────────────────────────────

def new_slide(c):
    c.showPage()
    c.setPageSize((W, H))

def bg(c, col=None):
    c.setFillColor(col or FOND)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def accent_line(c, x, y, w=64, h=5, col=None):
    c.setFillColor(col or OR)
    c.roundRect(x, y, w, h, 2, fill=1, stroke=0)

def brand_strip(c):
    """Bande de marque en bas — logo gauche, url droite."""
    c.setFillColor(VERT2)
    c.rect(0, 0, W, 64, fill=1, stroke=0)
    # Ligne séparatrice
    c.setStrokeColor(OR3)
    c.setLineWidth(0.5)
    c.line(0, 64, W, 64)
    # Logo
    try:
        c.drawImage(LOGO, 36, 8, width=100, height=48, mask='auto')
    except Exception:
        c.setFillColor(OR)
        c.setFont('Helvetica-Bold', 13)
        c.drawString(40, 25, 'DIASPOINVEST')
    # URL
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 14)
    c.drawRightString(W - 36, 24, 'diaspoinvest.fr')

def slide_num(c, n, total=6):
    c.setFillColor(GRIS2)
    c.setFont('Helvetica', 13)
    c.drawRightString(W - 36, H - 42, f'{n} / {total}')

def eyebrow(c, text, x=60, y=880):
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 13)
    c.drawString(x, y, text)
    accent_line(c, x, y - 14, w=len(text) * 7.5)

def big_title(c, lines, y_start, size=68, col=None):
    c.setFillColor(col or BLANC)
    c.setFont('Helvetica-Bold', size)
    y = y_start
    for line in lines:
        c.drawString(60, y, line)
        y -= size * 1.22
    return y

def subtitle(c, lines, y_start, size=22, col=None):
    c.setFillColor(col or GRIS)
    c.setFont('Helvetica', size)
    y = y_start
    for line in lines:
        c.drawString(60, y, line)
        y -= size * 1.5
    return y

def disclaimer(c, text, y=80):
    c.setFillColor(GRIS2)
    c.setFont('Helvetica-Oblique', 11)
    c.drawCentredString(W / 2, y, text)


# ──────────────────────────────
# SLIDE 1 — HOOK (arrêt du scroll)
# Tension maximale · contre-intuitif · personnel
# ──────────────────────────────
def s1(c):
    bg(c)
    # Glow subtil
    c.setFillColor(VERT)
    c.setFillAlpha(0.25)
    c.circle(W - 80, H - 80, 480, fill=1, stroke=0)
    c.setFillAlpha(1)

    slide_num(c, 1)
    brand_strip(c)

    # Eyebrow
    eyebrow(c, 'HISTOIRE VRAIE')

    # Titre — choc
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 72)
    c.drawString(60, 760, 'Mon conseiller')
    c.drawString(60, 672, 'bancaire ne m\'a')
    c.drawString(60, 584, 'jamais parle')

    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 72)
    c.drawString(60, 496, 'de la BRVM.')

    # Sous-titre
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 23)
    c.drawString(60, 430, 'Pourtant, certaines actions africaines')
    c.drawString(60, 398, 'versent 6% de dividende par an.')

    # Ligne de rupture
    c.setStrokeColor(OR3)
    c.setLineWidth(0.8)
    c.line(60, 360, W - 60, 360)

    # Setup/swipe
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 21)
    c.drawString(60, 320, 'Ce carrousel explique ce que personne')
    c.drawString(60, 288, 'ne t\'a dit sur l\'investissement en Afrique.')

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(60, 180, u'→  FAIS DEFILER  →')


# ──────────────────────────────
# SLIDE 2 — LE PROBLÈME
# Resonance emotionnelle · identification
# ──────────────────────────────
def s2(c):
    bg(c)
    slide_num(c, 2)
    brand_strip(c)

    eyebrow(c, 'LE PROBLEME')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 62)
    c.drawString(60, 760, 'Tu epargnes.')
    c.drawString(60, 680, 'Mais pour qui ?')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 22)
    c.drawString(60, 618, 'Le Livret A te verse 1,5 % par an.')
    c.drawString(60, 586, 'L\'inflation en France : 2,3 %.')

    # Impact visuel — tu perds de l'argent
    c.setFillColor(VERT2)
    c.roundRect(60, 470, W - 120, 92, 10, fill=1, stroke=0)
    c.setStrokeColor(ROUGE)
    c.setLineWidth(1.5)
    c.roundRect(60, 470, W - 120, 92, 10, fill=0, stroke=1)
    c.setFillColor(ROUGE)
    c.setFont('Helvetica-Bold', 20)
    c.drawString(80, 530, u'→  En termes reels, tu perds 0,8 % de pouvoir d\'achat chaque annee.')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 17)
    c.drawString(80, 498, 'Ton argent dort. Il ne travaille pas pour toi.')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 26)
    c.drawString(60, 330, 'La vraie question :')
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 36)
    c.drawString(60, 278, 'Existe-t-il une alternative serieuse')
    c.drawString(60, 232, 'pour investir au pays ?')

    # Réponse — sobre, percutante
    c.setFillColor(VERT)
    c.roundRect(60, 130, W - 120, 80, 10, fill=1, stroke=0)
    c.setStrokeColor(VERT_HL)
    c.setLineWidth(1.5)
    c.roundRect(60, 130, W - 120, 80, 10, fill=0, stroke=1)
    c.setFillColor(VERT_HL)
    c.setFont('Helvetica-Bold', 28)
    c.drawCentredString(W / 2, 178, u'Oui. Elle existe depuis 1998.  →')


# ──────────────────────────────
# SLIDE 3 — LA PREUVE
# Un seul chiffre · énorme · concret
# ──────────────────────────────
def s3(c):
    bg(c)
    # Glow or
    c.setFillColor(OR3)
    c.setFillAlpha(0.08)
    c.circle(W / 2, 480, 500, fill=1, stroke=0)
    c.setFillAlpha(1)

    slide_num(c, 3)
    brand_strip(c)

    eyebrow(c, 'LA PREUVE')

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 38)
    c.drawString(60, 760, 'SONATEL · Senegal · Telecoms · 8 pays')

    # Chiffre géant — le seul élément de cette slide
    c.setFillColor(OR2)
    c.setFont('Helvetica-Bold', 200)
    c.drawCentredString(W / 2, 440, '6,13')

    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 42)
    c.drawCentredString(W / 2, 370, '% de dividende brut par an')

    # Ligne séparatrice
    c.setStrokeColor(VERT3)
    c.setLineWidth(1)
    c.line(60, 330, W - 60, 330)

    # Décomposition simple
    cols = [
        (W / 2 - 300, '1 740 FCFA',   'par action · par an'),
        (W / 2,        '28 400 FCFA',  'prix d\'une action (~43 EUR)'),
        (W / 2 + 300,  '47',           'actions cotees sur la BRVM'),
    ]
    for cx, val, label in cols:
        c.setFillColor(BLANC)
        c.setFont('Helvetica-Bold', 22)
        c.drawCentredString(cx, 278, val)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 14)
        c.drawCentredString(cx, 254, label)

    disclaimer(c, 'Donnees BRVM · exercice 2024 · pas une promesse de rendement futur')


# ──────────────────────────────
# SLIDE 4 — L'IMPACT
# Chiffres réels du backtest diaspoinvest.fr · jan 2020 → juin 2026 (78 mois)
# ──────────────────────────────
def s4(c):
    bg(c)
    slide_num(c, 4)
    brand_strip(c)

    eyebrow(c, "L'IMPACT")

    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 52)
    c.drawString(60, 760, '50 000 FCFA par mois.')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 22)
    c.drawString(60, 714, 'Jan. 2020 → Juin 2026.  78 mois.  Meme montant. Deux choix.')

    # ── Deux blocs côte à côte ──
    gap_mid = 14
    bh = 430
    by = 170
    bw = (W - 120 - gap_mid) / 2

    def bloc(x, titre, col_bord, periode, cap_label, cap_val, val_label, val_val, val_col, perf, perf_col, source=None):
        c.setFillColor(VERT2)
        c.roundRect(x, by, bw, bh, 12, fill=1, stroke=0)
        c.setStrokeColor(col_bord)
        c.setLineWidth(1.5)
        c.roundRect(x, by, bw, bh, 12, fill=0, stroke=1)

        # Header
        c.setFillColor(col_bord)
        c.setFont('Helvetica-Bold', 15)
        c.drawCentredString(x + bw / 2, by + bh - 28, titre)
        c.setStrokeColor(VERT3)
        c.setLineWidth(0.5)
        c.line(x + 20, by + bh - 42, x + bw - 20, by + bh - 42)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 13)
        c.drawCentredString(x + bw / 2, by + bh - 62, periode)

        # Capital
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 13)
        c.drawCentredString(x + bw / 2, by + 312, cap_label)
        c.setFillColor(BLANC)
        c.setFont('Helvetica-Bold', 26)
        c.drawCentredString(x + bw / 2, by + 284, cap_val)

        # Séparateur
        c.setStrokeColor(VERT3)
        c.setLineWidth(0.5)
        c.line(x + 30, by + 268, x + bw - 30, by + 268)

        # Valeur finale
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 13)
        c.drawCentredString(x + bw / 2, by + 244, val_label)
        c.setFillColor(val_col)
        c.setFont('Helvetica-Bold', 40)
        c.drawCentredString(x + bw / 2, by + 196, val_val)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 12)
        c.drawCentredString(x + bw / 2, by + 174, 'FCFA')

        # Performance
        c.setFillColor(perf_col)
        c.setFillAlpha(0.15)
        c.roundRect(x + 20, by + 60, bw - 40, 90, 8, fill=1, stroke=0)
        c.setFillAlpha(1)
        c.setFillColor(perf_col)
        c.setFont('Helvetica-Bold', 34)
        c.drawCentredString(x + bw / 2, by + 106, perf)
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 11)
        c.drawCentredString(x + bw / 2, by + 76, 'performance totale')

        # Source
        if source:
            c.setFillColor(OR3)
            c.setFont('Helvetica-Bold', 11)
            c.drawCentredString(x + bw / 2, by + 22, source)

    # Livret A  (taux moyen ~1,5% sur la periode, estimation)
    bloc(
        x        = 60,
        titre    = 'LIVRET A  —  ~1,5 % / an',
        col_bord = ROUGE,
        periode  = '50 000 FCFA / mois · 78 mois',
        cap_label= 'Versements cumulatifs',
        cap_val  = '~3 900 000 FCFA',
        val_label= 'Valeur estimee',
        val_val  = '~4 100 000',
        val_col  = ROUGE,
        perf     = '+5,1 %',
        perf_col = ROUGE,
        source   = 'Estimation (taux moyen sur la periode)',
    )

    # BRVM Sonatel  (chiffres réels backtest diaspoinvest.fr)
    bloc(
        x        = 60 + bw + gap_mid,
        titre    = 'BRVM SONATEL  —  6,13 % / an',
        col_bord = VERT_HL,
        periode  = '50 000 FCFA / mois · 78 mois',
        cap_label= 'Capital effectivement investi',
        cap_val  = '3 177 735 FCFA',
        val_label= 'Valeur actuelle portefeuille',
        val_val  = '5 461 900',
        val_col  = OR2,
        perf     = '+71,9 %',
        perf_col = VERT_HL,
        source   = u'Source : diaspoinvest.fr/backtest  (donnees BRVM officielles)',
    )

    # VS central
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 20)
    c.drawCentredString(W / 2, by + bh / 2, 'VS')


# ──────────────────────────────
# SLIDE 5 — LA PROCÉDURE RÉELLE
# 4 étapes honnêtes avec délais vrais
# ──────────────────────────────
def s5(c):
    bg(c)
    slide_num(c, 5)
    brand_strip(c)

    eyebrow(c, 'LA PROCEDURE')

    # Titre — sous l'eyebrow, AVANT les cartes (pas de subtitle pour garder de l'espace)
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 44)
    c.drawString(60, 820, 'Comment investir sur la BRVM.')

    # 4 étapes avec délais honnêtes
    # y_top=655 → carte 01 top = 655+150 = 805 < 820 (baseline titre) → pas de chevauchement
    steps = [
        ('01', OR,      'Choisir une SGI agreee CREPMF',
         'Va sur brvm.org  →  onglet "SGI"  →  liste officielle des intermediaires agrees.',
         'Verifie qu\'elle accepte les clients de la diaspora avant de contacter.'),
        ('02', OR,      'Constituer et envoyer ton dossier',
         'Piece d\'identite + justificatif de domicile + formulaire d\'ouverture de compte.',
         'Delai d\'ouverture du compte : 2 a 6 semaines selon la reactivite de la SGI.'),
        ('03', VERT_HL, 'Approvisionner ton compte',
         'Virement depuis ta banque habituelle (SEPA ou Swift selon la SGI).',
         'Pas de minimum legal. Chaque SGI fixe ses propres conditions.'),
        ('04', VERT_HL, 'Passer ton premier ordre',
         'Via la plateforme en ligne de la SGI, ou par email / telephone.',
         'Toutes les SGIs ne proposent pas encore d\'interface numerique.'),
    ]

    card_h = 150
    gap    = 10
    y_top  = 655

    for i, (num, col, titre, desc1, desc2) in enumerate(steps):
        cy = y_top - i * (card_h + gap)

        c.setFillColor(VERT2)
        c.roundRect(60, cy, W - 120, card_h, 8, fill=1, stroke=0)

        # Barre gauche colorée
        c.setFillColor(col)
        c.roundRect(60, cy, 5, card_h, 2, fill=1, stroke=0)

        # Numéro
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 36)
        c.drawString(82, cy + card_h - 58, num)

        # Titre
        c.setFillColor(BLANC)
        c.setFont('Helvetica-Bold', 18)
        c.drawString(140, cy + card_h - 32, titre)

        # Détails
        c.setFillColor(GRIS)
        c.setFont('Helvetica', 14)
        c.drawString(140, cy + card_h - 60, desc1)
        c.drawString(140, cy + card_h - 82, desc2)

    # Avertissement honnête — juste sous la 4e carte
    # warn_y = 655 - 3*(160) - 28 = 655 - 480 - 28 = 147
    warn_y = y_top - 3 * (card_h + gap) - 28
    c.setFillColor(HexColor('#2A1A0A'))
    c.roundRect(60, warn_y - 22, W - 120, 54, 8, fill=1, stroke=0)
    c.setStrokeColor(OR3)
    c.setLineWidth(1)
    c.roundRect(60, warn_y - 22, W - 120, 54, 8, fill=0, stroke=1)
    c.setFillColor(OR)
    c.setFont('Helvetica-Bold', 13)
    c.drawString(80, warn_y + 10,
        u'La patience est necessaire : le processus peut prendre 4 a 8 semaines selon la SGI choisie.')
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 12)
    c.drawString(80, warn_y - 10, u'Guide detaille disponible sur  diaspoinvest.fr')


# ──────────────────────────────
# SLIDE 6 — CTA
# Objectif : trafic vers diaspoinvest.fr · pas de vente
# ──────────────────────────────
def s6(c):
    bg(c)
    c.setFillColor(VERT)
    c.setFillAlpha(0.18)
    c.circle(W / 2, H / 2, 580, fill=1, stroke=0)
    c.setFillAlpha(1)

    slide_num(c, 6)
    brand_strip(c)

    # Accroche
    c.setFillColor(GRIS)
    c.setFont('Helvetica', 19)
    c.drawCentredString(W / 2, 882, 'Tu as lu jusqu\'ici. C\'est un bon signe.')

    # Titre
    c.setFillColor(BLANC)
    c.setFont('Helvetica-Bold', 70)
    c.drawCentredString(W / 2, 778, 'Teste par toi-meme.')

    c.setFillColor(GRIS)
    c.setFont('Helvetica', 22)
    c.drawCentredString(W / 2, 726, 'Avant d\'investir le moindre franc, explore les outils.')

    # Séparateur
    c.setStrokeColor(OR3)
    c.setLineWidth(0.8)
    c.line(160, 698, W - 160, 698)

    # 3 outils — cartes avec URL visible
    outils = [
        ('/screener',  'Les 47 actions',          'Cours, rendement, secteur.', VERT_HL),
        ('/backtest',  'Simule ton DCA',           'Entre ton montant, choisis une action.', OR),
        ('/newsletter','La lettre du lundi',        'Analyse hebdo. Gratuite.', HexColor('#63B3ED')),
    ]
    ow = (W - 120 - 2 * 16) / 3
    oy = 480
    oh = 200
    for i, (path, titre, desc, col) in enumerate(outils):
        ox = 60 + i * (ow + 16)
        c.setFillColor(VERT2)
        c.roundRect(ox, oy, ow, oh, 10, fill=1, stroke=0)
        c.setStrokeColor(col)
        c.setLineWidth(1.5)
        c.roundRect(ox, oy, ow, oh, 10, fill=0, stroke=1)

        # Couleur barre haut
        c.setFillColor(col)
        c.roundRect(ox, oy + oh - 5, ow, 5, 2, fill=1, stroke=0)

        c.setFillColor(BLANC)
        c.setFont('Helvetica-Bold', 18)
        c.drawCentredString(ox + ow / 2, oy + oh - 38, titre)

        c.setFillColor(GRIS)
        c.setFont('Helvetica', 13)
        c.drawCentredString(ox + ow / 2, oy + oh - 64, desc)

        # URL en bas de la carte
        c.setFillColor(col)
        c.setFont('Helvetica-Bold', 13)
        c.drawCentredString(ox + ow / 2, oy + 22, 'diaspoinvest.fr' + path)

    # Grand bouton URL principal
    bw2, bh2 = 580, 72
    bbx = W / 2 - bw2 / 2
    bby2 = 340
    c.setFillColor(OR3)
    c.roundRect(bbx, bby2, bw2, bh2, bh2 / 2, fill=1, stroke=0)
    c.setFillColor(FOND)
    c.setFont('Helvetica-Bold', 24)
    c.drawCentredString(W / 2, bby2 + 25, 'diaspoinvest.fr')

    # Phrase signature
    c.setFillColor(OR)
    c.setFillAlpha(0.5)
    c.setFont('Helvetica-BoldOblique', 15)
    c.drawCentredString(W / 2, 294,
        u'"Ces chiffres ne vont pas changer parce que tu n\'as pas ouvert ton compte."')
    c.setFillAlpha(1)

    c.setFillColor(GRIS2)
    c.setFont('Helvetica', 12)
    c.drawCentredString(W / 2, 208, 'Jordan · DiaspoInvest · contact@diaspoinvest.fr')
    c.drawCentredString(W / 2, 188,
        'Contenu educatif. Non affilie a la BRVM ni au CREPMF. Pas un conseil en investissement.')


# ──────────────────────────────
# GENERATION
# ──────────────────────────────
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
    print(f"PDF : {OUT}")
    print(f"Taille : {os.path.getsize(OUT) // 1024} KB · 6 slides 1080x1080")
