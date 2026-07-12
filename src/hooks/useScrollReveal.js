import { useEffect, useRef } from 'react'

export default function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => {
      el.classList.add('revealed')
      el.querySelectorAll('.reveal').forEach(child => child.classList.add('revealed'))
    }

    // Fail-safe : si l'IntersectionObserver n'existe pas, ou si le document
    // n'est pas peint (onglet en arrière-plan → observers throttlés), on
    // révèle tout de suite. Le contenu ne doit JAMAIS rester invisible.
    if (typeof IntersectionObserver === 'undefined' || document.hidden) {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.unobserve(el)
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px' }
    )

    observer.observe(el)

    // Si l'onglet passe à l'arrière-plan avant que l'utilisateur ait scrollé,
    // on révèle sans attendre pour éviter tout contenu bloqué à opacity 0.
    const onHide = () => { if (document.hidden) { reveal(); observer.disconnect() } }
    document.addEventListener('visibilitychange', onHide)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  return ref
}
