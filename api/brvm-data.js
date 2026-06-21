/**
 * DiaspoInvest — API route Vercel
 * Sert le dernier JSON BRVM depuis le dépôt privé GitHub.
 *
 * Variable d'environnement Vercel requise :
 *   GITHUB_TOKEN — Personal Access Token avec scope "repo" (read-only suffit)
 *   → Vercel dashboard > Settings > Environment Variables > GITHUB_TOKEN
 *
 * Si le token manque ET que le dépôt est public → fonctionne quand même.
 * Cache 30 min côté CDN Vercel pour limiter les appels GitHub.
 */

const RAW_URL =
  'https://raw.githubusercontent.com/Jordy-Pr0g/diaspoinvest-automation/main/scripts/data/brvm_latest.json'

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
    const headers = { 'User-Agent': 'DiaspoInvest-Cockpit/1.0' }
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
