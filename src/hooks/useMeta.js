import { useEffect } from 'react'

const DEFAULT = {
  title: 'DiaspoInvest — Investir sur la bourse africaine',
  description: 'DiaspoInvest — Apprends à investir sur la BRVM depuis la France ou le continent. Cours en temps réel, simulateur DCA 30 ans, fiscalité expliquée.',
  url: 'https://diaspoinvest.fr/',
}

function setMeta({ title, description, url }) {
  document.title = title
  const set = (sel, val) => document.querySelector(sel)?.setAttribute('content', val)
  set('meta[name="description"]', description)
  set('meta[property="og:title"]', title)
  set('meta[property="og:description"]', description)
  set('meta[property="og:url"]', url)
  set('meta[name="twitter:title"]', title)
  set('meta[name="twitter:description"]', description)
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) canonical.setAttribute('href', url)
}

export function useMeta({ title, description, url }) {
  useEffect(() => {
    setMeta({ title, description, url })
    return () => setMeta(DEFAULT)
  }, [title, description, url])
}
