import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Remonte en haut de page à chaque changement de route.
// Exception : si l'URL contient une ancre (#pricing...), on laisse le
// navigateur aller à l'ancre au lieu de forcer le haut de page.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Va jusqu'à l'ancre (ex : #pricing). Le contenu peut être chargé en
      // différé (lazy), donc on tente tout de suite puis après un court délai.
      const id = hash.replace('#', '')
      const go = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
      go()
      const t = setTimeout(go, 350)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
