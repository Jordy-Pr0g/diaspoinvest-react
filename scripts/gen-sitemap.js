// Regenere public/sitemap.xml a partir des routes fixes + des articles de blog (src/data/articles.js).
// Tourne automatiquement avant chaque build (voir package.json), donc chaque nouvel article
// publie dans articles.js apparait dans le sitemap sans intervention manuelle.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const BASE = 'https://diaspoinvest.fr'

const PAGES_FIXES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/screener', changefreq: 'daily', priority: '0.9' },
  { loc: '/backtest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/fiscalite', changefreq: 'monthly', priority: '0.7' },
  { loc: '/portefeuille', changefreq: 'weekly', priority: '0.7' },
  { loc: '/guides', changefreq: 'monthly', priority: '0.6' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/a-propos', changefreq: 'monthly', priority: '0.4' },
]

function loadArticleSlugs() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/articles.js'), 'utf-8')
  const slugs = [...src.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1])
  return slugs
}

function buildUrl({ loc, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${BASE}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')
}

const today = new Date().toISOString().slice(0, 10)
const slugs = loadArticleSlugs()

const urls = [
  ...PAGES_FIXES.map(buildUrl),
  ...slugs.map(slug => buildUrl({ loc: `/blog/${slug}`, changefreq: 'monthly', priority: '0.6', lastmod: today })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`

fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), xml)
console.log(`[gen-sitemap] ${PAGES_FIXES.length} pages fixes + ${slugs.length} articles -> public/sitemap.xml`)
