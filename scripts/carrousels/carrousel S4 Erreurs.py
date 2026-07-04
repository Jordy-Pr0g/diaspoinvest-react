# -*- coding: utf-8 -*-
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
import os

OUT  = r"C:\Users\DJIOKAP JORDAN\Downloads\DiaspoInvest_Carrousel_S4_Erreurs.pdf"
LOGO = r"C:\Users\DJIOKAP JORDAN\Downloads\logo-horizontal-transparent.png"

FOND=HexColor('#060E09'); VERT=HexColor('#0D3B2E'); VERT2=HexColor('#0A1E12')
VERT3=HexColor('#1A3A28'); OR=HexColor('#D4AF37'); OR2=HexColor('#F5D67A')
OR3=HexColor('#C9A830'); GRIS=HexColor('#AAAAAA'); BLANC=white
VHL=HexColor('#4CAF7D'); ROUGE=HexColor('#E05252'); ROUGE2=HexColor('#2A0808')
W=H=1080

def ns(c): c.showPage(); c.setPageSize((W,H))
def bg(c,col): c.setFillColor(col); c.rect(0,0,W,H,fill=1,stroke=0)
def glow(c,cx,cy,r,col,a=0.3):
    for i in range(10,0,-1): c.setFillColor(col); c.setFillAlpha(a*i/50); c.circle(cx,cy,r*i/10,fill=1,stroke=0)
    c.setFillAlpha(1)
def grid(c):
    c.saveState(); c.setStrokeColor(HexColor('#1A6B4A')); c.setStrokeAlpha(0.06); c.setLineWidth(0.5)
    for x in range(0,W+50,50): c.line(x,0,x,H)
    for y in range(0,H+50,50): c.line(0,y,W,y)
    c.restoreState()
def brand(c):
    c.drawImage(LOGO, 40, 18, width=83, height=48, mask='auto')
def snum(c,n,t=8):
    c.setFillColor(OR); c.setFillAlpha(0.45); c.setFont('Helvetica-Bold',12)
    c.drawRightString(W-44,H-48,f'{n} / {t}'); c.setFillAlpha(1)
def card(c,x,y,w,h,bgc,brd=None,lbar=False):
    c.setFillColor(bgc); c.roundRect(x,y,w,h,12,fill=1,stroke=0)
    if brd: c.setStrokeColor(brd); c.setLineWidth(1); c.roundRect(x,y,w,h,12,fill=0,stroke=1)
    if lbar: c.setFillColor(ROUGE); c.roundRect(x,y,5,h,2,fill=1,stroke=0)
def cta(c):
    cx=W/2; bw=520; bh=60
    c.setFillColor(OR3); c.roundRect(cx-bw/2,300,bw,bh,bh/2,fill=1,stroke=0)
    c.setFillColor(VERT); c.setFont('Helvetica-Bold',17); c.drawCentredString(cx,328,'Guide complet sur diaspoinvest.fr — 14,99 EUR')
    c.linkURL('https://diaspoinvest.fr',(cx-bw/2,300,cx+bw/2,360),relative=0)
    c.setStrokeColor(OR); c.setLineWidth(1.5); c.roundRect(cx-bw/2,224,bw,bh,bh/2,fill=0,stroke=1)
    c.setFillColor(OR); c.setFont('Helvetica-Bold',15); c.drawCentredString(cx,252,'Newsletter gratuite — diaspoinvest.fr')
    c.linkURL('https://diaspoinvest.fr',(cx-bw/2,224,cx+bw/2,284),relative=0)
    c.setFillColor(OR); c.setFillAlpha(0.4); c.setFont('Helvetica-BoldOblique',14)
    c.drawCentredString(cx,170,'"Ces chiffres ne vont pas changer parce que tu n\'as pas encore ouvert ton compte."')
    c.setFillAlpha(1)
    c.setFillColor(OR3); c.roundRect(cx-14,110,28,28,5,fill=1,stroke=0)
    c.setFillColor(VERT); c.setFont('Helvetica-Bold',9); c.drawCentredString(cx,121,'DI')
    c.setFillColor(OR); c.setFillAlpha(0.6); c.setFont('Helvetica',11)
    c.drawCentredString(cx,94,'DiaspoInvest · contact@diaspoinvest.fr · diaspoinvest.fr')
    c.linkURL('https://diaspoinvest.fr',(cx-220,84,cx+220,104),relative=0); c.setFillAlpha(1)

ERREURS = [
    ('01', 'Vendre dans la panique',
     'C\'est l\'erreur que j\'ai failli faire.',
     'Des membres de la communauté ont vendu Sonatel lors d\'une baisse de 15%. Ils l\'ont rachetée 20% plus cher 3 mois après. La baisse est temporaire. La panique coûte cher.',
     'Solution : un plan écrit, suivi chaque mois. Tu ne vends que si les fondamentaux changent.'),
    ('02', 'Tout mettre sur une seule action',
     'La concentration, c\'est un piège.',
     'Si 100% de ton portefeuille est sur Sonatel et que Sonatel chute de 20%, tu perds 20%. Si tu es sur 3 actions différentes, tu limites l\'impact.',
     'Solution : jamais plus de 40% sur une seule action. Règle absolue.'),
    ('03', 'Oublier le formulaire 3916',
     'L\'erreur qui coûte 1 500 EUR par an.',
     'Tout résident fiscal français avec un compte SGI à l\'étranger doit déclarer ce compte chaque année sur impots.gouv.fr. Pas de formulaire 3916 = amende automatique de 1 500 EUR.',
     'Solution : 5 minutes par an sur impots.gouv.fr. Section "Comptes à l\'étranger".'),
    ('04', 'Investir de l\'argent dont on a besoin',
     'La BRVM, c\'est 5 à 10 ans minimum.',
     'Si tu investis des économies dont tu pourrais avoir besoin dans 6 mois, et que le marché baisse, tu es forcé de vendre au mauvais moment. C\'est ainsi que des investisseurs transforment une baisse temporaire en perte définitive.',
     'Solution : garde 3 à 6 mois de dépenses en épargne liquide avant d\'investir sur la BRVM.'),
    ('05', 'Choisir une SGI non agréée CREPMF',
     'L\'erreur qui peut tout faire perdre.',
     'Des applications mobiles et des plateformes non réglementées se présentent comme des accès à la BRVM. Elles n\'ont aucun agrément. Tes fonds ne sont protégés par aucun dispositif légal.',
     'Solution : vérifie toujours sur crepmf.org avant d\'ouvrir un compte. Seules les SGI agréées sont légales.'),
]

# S1 — HOOK
def s1(c):
    bg(c,FOND); glow(c,W/2,H,600,ROUGE,0.25); grid(c)
    snum(c,1); brand(c)
    c.setFillColor(ROUGE); c.setFont('Helvetica-Bold',13)
    c.drawString(88,710,'LES 5 ERREURS DES DÉBUTANTS SUR LA BRVM')
    c.setFillColor(BLANC); c.setFont('Helvetica-Bold',72)
    c.drawString(80,558,'Ces 5 erreurs')
    c.drawString(80,468,'coûtent de')
    c.setFillColor(OR2); c.drawString(80,378,'l\'argent.')
    c.setFillColor(GRIS); c.setFont('Helvetica-BoldOblique',22)
    c.drawString(80,316,'J\'en ai fait certaines.')
    c.setFillColor(BLANC); c.setFont('Helvetica',19)
    c.drawString(80,258,'Liquidité, frais cachés, formulaire 3916, concentration,')
    c.drawString(80,230,'vendre dans la panique.')
    c.drawString(80,174,'Swipe pour ne pas les répéter.')
    c.setFillColor(OR); c.setFont('Helvetica-Bold',14)
    c.drawString(80,114,'→  8 SLIDES · SAVE CE CARROUSEL')

# S2 à S6 — une erreur par slide
def erreur_slide(c, n, num, titre, accroche, desc, solution):
    bg(c, FOND)
    # Fond rouge subtil
    glow(c, W/2, H/2, 500, ROUGE, 0.15)
    snum(c, n); brand(c)

    # Badge erreur
    c.setFillColor(ROUGE2); c.roundRect(80, H-120, 160, 60, 10, fill=1, stroke=0)
    c.setStrokeColor(ROUGE); c.setLineWidth(1.5); c.roundRect(80,H-120,160,60,10,fill=0,stroke=1)
    c.setFillColor(ROUGE); c.setFont('Helvetica-Bold',14)
    c.drawCentredString(160, H-98, f'ERREUR {num}')

    # Titre
    c.setFillColor(BLANC); c.setFont('Helvetica-Bold',54)
    # Wrap title
    words = titre.split()
    line = ''; lines_t = []
    for w in words:
        test = line + ' ' + w if line else w
        if len(test) > 28: lines_t.append(line); line = w
        else: line = test
    if line: lines_t.append(line)
    for i, lt in enumerate(lines_t):
        c.drawString(80, H-180-i*64, lt)

    # Accroche
    c.setFillColor(OR2); c.setFont('Helvetica-BoldOblique', 22)
    c.drawString(80, H-180-len(lines_t)*64-20, accroche)

    # Séparateur
    c.setStrokeColor(ROUGE); c.setLineWidth(2)
    c.line(80, H-180-len(lines_t)*64-48, W-80, H-180-len(lines_t)*64-48)

    # Description
    y_start = H-180-len(lines_t)*64-80
    c.setFillColor(BLANC); c.setFont('Helvetica', 17)
    words2 = desc.split()
    line2 = ''; lines2 = []
    for w in words2:
        test = line2+' '+w if line2 else w
        if len(test) > 58: lines2.append(line2); line2 = w
        else: line2 = test
    if line2: lines2.append(line2)
    for i, l in enumerate(lines2):
        if y_start - i*28 > 280:
            c.drawString(80, y_start-i*28, l)

    # Solution box
    card(c, 60, 120, W-120, 150, VERT2, VHL, lbar=False)
    c.setStrokeColor(VHL); c.setLineWidth(1.5); c.roundRect(60,120,W-120,150,12,fill=0,stroke=1)
    c.setFillColor(VHL); c.setFont('Helvetica-Bold',16); c.drawString(82,242,'✓  SOLUTION')
    c.setFillColor(BLANC); c.setFont('Helvetica',15)
    sol_words = solution.split()
    sol_line = ''; sol_lines = []
    for w in sol_words:
        test = sol_line+' '+w if sol_line else w
        if len(test) > 72: sol_lines.append(sol_line); sol_line = w
        else: sol_line = test
    if sol_line: sol_lines.append(sol_line)
    for i, sl in enumerate(sol_lines[:3]):
        c.drawString(82, 210-i*26, sl)

# S7 — RÉCAP
def s7(c):
    bg(c, FOND); snum(c, 7); brand(c)
    c.setFillColor(OR); c.setFont('Helvetica-Bold',16)
    c.drawString(80, H-80, 'RÉCAPITULATIF — LES 5 ERREURS À ÉVITER')

    for i, (num, titre, _, _, _) in enumerate(ERREURS):
        y = H - 200 - i*130
        card(c, 60, y, W-120, 110, VERT2, VERT3)
        c.setFillColor(ROUGE); c.circle(110, y+55, 26, fill=1, stroke=0)
        c.setFillColor(BLANC); c.setFont('Helvetica-Bold',14); c.drawCentredString(110,y+48,num)
        c.setFillColor(BLANC); c.setFont('Helvetica-Bold',20); c.drawString(154,y+64,titre)
        c.setFillColor(VERT_HL if True else GRIS)
        c.setFillColor(VHL); c.setFont('Helvetica-Bold',13); c.drawString(154,y+36,'✓ Évitable avec un plan')

VERT_HL = VHL

# S8 — CTA
def s8(c):
    bg(c, FOND); glow(c, W/2, 400, 500, VERT, 0.35); snum(c, 8)
    cx = W/2
    c.setFillColor(OR3); c.roundRect(cx-36,820,72,72,14,fill=1,stroke=0)
    c.setFillColor(VERT); c.setFont('Helvetica-Bold',28); c.drawCentredString(cx,845,'DI')
    c.setFillColor(OR); c.setFont('Helvetica-Bold',13); c.drawCentredString(cx,796,'D I A S P O I N V E S T')
    c.setFillColor(BLANC); c.setFont('Helvetica-Bold',58)
    c.drawCentredString(cx,690,'Tu connais les pièges.')
    c.setFillColor(OR2); c.drawCentredString(cx,614,'Il ne reste qu\'à agir.')
    c.setFillColor(GRIS); c.setFont('Helvetica',18)
    c.drawCentredString(cx,548,'Le guide t\'accompagne de A à Z.')
    c.drawCentredString(cx,518,'Le Tracker suit ton portefeuille mois par mois.')
    cta(c)

c = canvas.Canvas(OUT, pagesize=(W,H))
s1(c); ns(c)
for i, (num,titre,accroche,desc,sol) in enumerate(ERREURS):
    erreur_slide(c, i+2, num, titre, accroche, desc, sol)
    ns(c)
s7(c); ns(c)
s8(c)
c.save()
print(f"PDF : {OUT} · {os.path.getsize(OUT)//1024} KB · 8 slides")
