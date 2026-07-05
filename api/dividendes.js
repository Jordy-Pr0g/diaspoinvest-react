/**
 * DiaspoInvest — API route Vercel
 * Sert le dernier JSON dividendes (croisé multi-sources) depuis le dépôt GitHub.
 *
 * Variable d'environnement Vercel (déjà en place pour /api/brvm-data) :
 *   GITHUB_TOKEN — Personal Access Token scope "repo" (read-only suffit)
 *
 * Données produites par scripts/brvm_dividendes.py (brvm.org officiel +
 * sikafinance + fluxbourse, écarts signalés). Cache 30 min côté CDN.
 */

const RAW_URL =
  'https://raw.githubusercontent.com/Jordy-Pr0g/diaspoinvest-automation/main/scripts/data/dividendes_latest.json'

const ALLOWED_ORIGINS = [
  'https://diaspoinvest.fr',
  'https://www.diaspoinvest.fr',
]

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const token = (process.env.GITHUB_TOKEN || '').replace(/^﻿/, '').trim()
    const headers = { 'User-Agent': 'DiaspoInvest-Dividendes/1.0' }
    if (token) headers['Authorization'] = `token ${token}`

    const r = await fetch(RAW_URL, { headers })
    if (!r.ok) {
      return res.status(502).json({ error: `GitHub ${r.status} — données indisponibles` })
    }
    const data = await r.json()

    // Cache 30 min CDN, revalidation silencieuse 1h
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
}
