// Génère src/data/project-state.generated.js à chaque build (hook prebuild).
// But : que les agents du Cockpit connaissent AUTOMATIQUEMENT l'état réel du site
// (pages, outils, endpoints) et les dernières modifications, sans mise à jour manuelle.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const root = process.cwd()

// 1) Routes publiques depuis App.jsx
let routes = []
try {
  const app = readFileSync(`${root}/src/App.jsx`, 'utf8')
  routes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*')
} catch { /* ignore */ }

// 2) Pages HTML statiques (entrées Vite)
const htmlPages = readdirSync(root).filter(f => f.endsWith('.html'))

// 3) Endpoints API
let api = []
try {
  api = readdirSync(`${root}/api`).filter(f => f.endsWith('.js')).map(f => '/api/' + f.replace(/\.js$/, ''))
} catch { /* ignore */ }

// 4) Journal des dernières modifications (git). Échoue en silence si indisponible.
let changelog = []
try {
  const out = execSync('git log -18 --pretty=format:%s', { cwd: root, encoding: 'utf8' })
  changelog = out.split('\n').map(s => s.trim()).filter(Boolean)
} catch { /* clone superficiel ou pas de git : on ignore */ }

const bloc = [
  '=== ÉTAT TECHNIQUE DU SITE (généré au build, fait foi sur ce qui existe) ===',
  `Pages publiques : ${routes.join(' · ') || '—'}`,
  `Pages/outils internes : ${htmlPages.join(' · ') || '—'}`,
  `Endpoints API : ${api.join(' · ') || '—'}`,
  '',
  'DERNIÈRES MODIFICATIONS DU PROJET (journal, de la plus récente à la plus ancienne) :',
  ...(changelog.length ? changelog.map(c => `- ${c}`) : ['- (journal indisponible dans cet environnement)']),
  '',
  'Sers-toi de cette liste pour savoir ce qui a déjà été construit. Ne propose pas de refaire ce qui existe déjà.',
].join('\n')

const fileBody = `// FICHIER GÉNÉRÉ AUTOMATIQUEMENT par scripts/gen-project-state.js — ne pas éditer à la main.
export const PROJECT_STATE = ${JSON.stringify('\n\n' + bloc)}
`

writeFileSync(`${root}/src/data/project-state.generated.js`, fileBody)
console.log(`[gen-project-state] ${routes.length} routes, ${api.length} API, ${changelog.length} commits -> src/data/project-state.generated.js`)
