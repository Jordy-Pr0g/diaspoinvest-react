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
      // différé (lazy) : on réessaie jusqu'à ce que l'élément existe, puis on
      // retire l'ancre de l'URL pour que les rechargements repartent du haut.
      const id = hash.replace('#', '')
      let tries = 0
      const timers = []
      const go = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          window.history.replaceState(null, '', pathname)
        } else if (tries < 10) {
          tries += 1
          timers.push(setTimeout(go, 150))
        }
      }
      go()
      return () => timers.forEach(clearTimeout)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
