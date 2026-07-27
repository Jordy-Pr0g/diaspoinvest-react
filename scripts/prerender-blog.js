// Prerendering SEO des articles de blog.
// Tourne APRES `vite build` (voir package.json). Pour chaque article de
// src/data/articles.js, rend le Markdown en HTML et l'injecte dans une copie
// de dist/index.html (mêmes assets, même analytics), avec titre/meta/canonical
// et un JSON-LD Article propres. Ecrit dist/blog/<slug>/index.html + dist/blog/index.html.
//
// Objectif : les robots (Google, ChatGPT, Perplexity, CCBot) qui n'exécutent
// pas le JavaScript reçoivent le texte complet de l'article. Pour un vrai
// visiteur, React se monte par-dessus #root et le SPA reprend la main.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const BASE = 'https://diaspoinvest.fr'

marked.setOptions({ breaks: true, gfm: true })

// --- Petits utilitaires --------------------------------------------------

// Enlève l'échappement JS des chaînes extraites (ex: \' -> ')
function unescapeJs(s) {
  return s.replace(/\\(['"\\])/g, '$1')
}

// Échappe pour un attribut HTML (content="...") ou du texte
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Convertit une date française ("4 juillet 2026") en ISO (2026-07-04) si possible.
const MOIS = {
  janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04',
  mai: '05', juin: '06', juillet: '07', août: '08', aout: '08',
  septembre: '09', octobre: '10', novembre: '11', décembre: '12', decembre: '12',
}
function dateIso(fr) {
  const m = String(fr).trim().toLowerCase().match(/(\d{1,2})\s+([a-zûé]+)\s+(\d{4})/i)
  if (!m) return null
  const mois = MOIS[m[2]]
  if (!mois) return null
  return `${m[3]}-${mois}-${String(m[1]).padStart(2, '0')}`
}

// --- Lecture des articles depuis src/data/articles.js --------------------

function loadArticles() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/articles.js'), 'utf-8')
  const STR = "'((?:\\\\.|[^'\\\\])*)'" // capture une chaîne JS avec échappements
  const slugRx = new RegExp('slug:\\s*' + STR, 'g')

  // Positions de chaque `slug:` pour découper le fichier en blocs d'article.
  const marks = []
  let m
  while ((m = slugRx.exec(src)) !== null) marks.push({ slug: unescapeJs(m[1]), index: m.index })

  const articles = []
  for (let i = 0; i < marks.length; i++) {
    const block = src.slice(marks[i].index, i + 1 < marks.length ? marks[i + 1].index : src.length)
    const grab = (field) => {
      const r = new RegExp('\\b' + field + ':\\s*' + STR)
      const g = block.match(r)
      return g ? unescapeJs(g[1]) : ''
    }
    const fileM = block.match(/import\('\.\.\/\.\.\/blog\/([^']+\.md)\?raw'\)/)
    articles.push({
      slug: marks[i].slug,
      titre: grab('titre'),
      description: grab('description'),
      date: grab('date'),
      lecture: grab('lecture'),
      file: fileM ? fileM[1] : null,
    })
  }
  return articles
}

// --- Construction d'une page ---------------------------------------------

// Remplace le contenu de <title>, de la meta description, des og:* et du
// canonical dans le template, puis injecte le corps dans #root et un JSON-LD.
function buildPage(template, { title, description, url, bodyHtml, jsonLd }) {
  let html = template

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

  const setMeta = (attr, name, value) => {
    const rx = new RegExp(`(<meta\\s+${attr}=["']${name}["']\\s+content=")[^"]*(")`)
    if (rx.test(html)) {
      html = html.replace(rx, `$1${escapeHtml(value)}$2`)
    } else {
      // Absente du template (React la pose au runtime) : on l'injecte pour les bots.
      html = html.replace('</head>', `  <meta ${attr}="${name}" content="${escapeHtml(value)}">\n</head>`)
    }
  }
  setMeta('name', 'description', description)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:type', 'article')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)

  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)

  if (jsonLd) {
    html = html.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>\n</head>`)
  }

  html = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${bodyHtml}</div>`)
  return html
}

// Enrobage sémantique commun (le contenu réel que lisent les robots).
function wrap(inner) {
  return (
    '<div style="max-width:760px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#0b1912">' +
    '<header><a href="/">DiaspoInvest</a> · <a href="/blog">Blog</a></header>' +
    inner +
    '<footer style="margin-top:40px;font-size:13px;color:#556">' +
    'Contenu éducatif. Ceci n\'est pas un conseil en investissement. ' +
    'DiaspoInvest n\'est affilié ni à la BRVM ni à l\'Autorité des Marchés Financiers de l\'UMOA.' +
    '</footer></div>'
  )
}

// --- Exécution -----------------------------------------------------------

function main() {
  const templatePath = path.join(DIST, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.error('[prerender-blog] dist/index.html introuvable — lance `vite build` d\'abord.')
    process.exit(1)
  }
  const template = fs.readFileSync(templatePath, 'utf-8')
  const articles = loadArticles()

  let ok = 0
  for (const a of articles) {
    if (!a.file) { console.warn(`[prerender-blog] pas de fichier .md pour ${a.slug}, ignoré`); continue }
    const mdPath = path.join(ROOT, 'blog', a.file)
    if (!fs.existsSync(mdPath)) { console.warn(`[prerender-blog] ${a.file} manquant, ignoré`); continue }

    const md = fs.readFileSync(mdPath, 'utf-8')
    const articleHtml = marked.parse(md).replace(/<hr\s*\/?>/g, '')
    const url = `${BASE}/blog/${a.slug}`
    const iso = dateIso(a.date)

    const inner = wrap(
      `<article><h1>${escapeHtml(a.titre)}</h1>` +
      `<p style="color:#667"><time${iso ? ` datetime="${iso}"` : ''}>${escapeHtml(a.date)}</time> · ${escapeHtml(a.lecture)} de lecture</p>` +
      articleHtml +
      `</article>`
    )

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.titre,
      description: a.description,
      inLanguage: 'fr-FR',
      author: { '@type': 'Person', name: 'Jordan Djiokap' },
      publisher: { '@type': 'Organization', name: 'DiaspoInvest', logo: `${BASE}/logo-512.png` },
      mainEntityOfPage: url,
      ...(iso ? { datePublished: iso } : {}),
    }

    const page = buildPage(template, { title: `${a.titre} — DiaspoInvest`, description: a.description, url, bodyHtml: inner, jsonLd })
    const outDir = path.join(DIST, 'blog', a.slug)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'index.html'), page)
    ok++
  }

  // Page d'index /blog : liste crawlable de tous les articles.
  const liste = articles.map(a =>
    `<li style="margin:0 0 18px"><a href="/blog/${a.slug}"><strong>${escapeHtml(a.titre)}</strong></a>` +
    `<br><span style="color:#667">${escapeHtml(a.description)}</span></li>`
  ).join('')
  const indexInner = wrap(`<h1>Blog DiaspoInvest — Investir sur la BRVM</h1><ul style="list-style:none;padding:0">${liste}</ul>`)
  const indexPage = buildPage(template, {
    title: 'Blog — DiaspoInvest',
    description: 'Guides pour investir sur la BRVM depuis la diaspora : SGI, fiscalité, dividendes, analyse d\'actions.',
    url: `${BASE}/blog`,
    bodyHtml: indexInner,
    jsonLd: null,
  })
  fs.mkdirSync(path.join(DIST, 'blog'), { recursive: true })
  fs.writeFileSync(path.join(DIST, 'blog', 'index.html'), indexPage)

  console.log(`[prerender-blog] ${ok}/${articles.length} articles prérendus + /blog -> dist/blog/`)
}

main()
