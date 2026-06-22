/**
 * DiaspoInvest — API route Vercel
 * Récupère l'historique mensuel d'une action BRVM depuis le repo public Fredysessie/brvm-data-public
 * Usage : /api/brvm-history?ticker=SNTS
 */

const BASE_URL = 'https://raw.githubusercontent.com/Fredysessie/brvm-data-public/main/data'

const ALLOWED_ORIGINS = [
  'https://diaspoinvest.fr',
  'https://www.diaspoinvest.fr',
]

function parseCSV(text) {
  const lines = text.trim().split('\n')
  // Skip header line
  return lines.slice(1).map(line => {
    const [date, open, high, low, close, volume] = line.split(',')
    return {
      date: date?.trim(),
      close: parseFloat(close) || null,
      volume: parseInt(volume) || 0,
    }
  }).filter(r => r.date && r.close)
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const ticker = (req.query.ticker || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!ticker) return res.status(400).json({ error: 'Paramètre ticker manquant' })

  try {
    const url = `${BASE_URL}/${ticker}/${ticker}.monthly.csv`
    const r = await fetch(url, { headers: { 'User-Agent': 'DiaspoInvest/1.0' } })

    if (!r.ok) {
      return res.status(404).json({ error: `Historique non disponible pour ${ticker}` })
    }

    const text = await r.text()
    const data = parseCSV(text)

    // Cache 6h CDN
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200')
    res.json({ ticker, count: data.length, data })
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
