/* ============================================================
   Scroll reveal — apparition élégante, façon AOS/Weblook
   Approche DÉTERMINISTE (scroll + requestAnimationFrame), sans les
   aléas d'IntersectionObserver.
   - anime des ÉLÉMENTS fins (titre, carte, ligne…), pas des sections
   - un élément se révèle dès qu'il franchit ~88 % de la hauteur d'écran
     (donc peu après être entré par le bas), puis reste visible (once)
   - cascade (stagger) entre voisins d'un même parent
   - fail-safe : jamais de contenu bloqué à opacity 0
   ============================================================ */

// Blocs animés : soit balisés `data-sr`, soit des classes stables déjà présentes.
const SELECTOR = '[data-sr], .section-head, .plan, .faq-item, .solution-card'
// Ligne de déclenchement, en proportion de la hauteur d'écran.
// 0.80 → l'élément s'anime quand son haut a franchi 80 % de l'écran :
// il est déjà nettement entré, l'apparition se voit sans être en retard.
const TRIGGER = 0.80

export function initScrollReveal() {
  const canAnimate = typeof requestAnimationFrame !== 'undefined'
  const staggerByParent = new WeakMap()

  // Prépare un élément (état caché + index de cascade). N'anime pas encore.
  const arm = (el) => {
    if (el.classList.contains('sr')) return
    const parent = el.parentElement || document.body
    const i = staggerByParent.get(parent) || 0
    staggerByParent.set(parent, i + 1)
    el.style.setProperty('--sr-i', Math.min(i, 6)) // cap le délai pour les longues listes
    el.classList.add('sr')
  }

  const scanArm = (node) => {
    if (node.nodeType !== 1) return
    if (node.matches && node.matches(SELECTOR)) arm(node)
    if (node.querySelectorAll) node.querySelectorAll(SELECTOR).forEach(arm)
  }

  const revealAllPending = () => {
    document.querySelectorAll('.sr:not(.sr-in)').forEach((el) => el.classList.add('sr-in'))
  }

  // Révèle tout ce qui est déjà suffisamment à l'écran.
  let ticking = false
  const revealVisible = () => {
    ticking = false
    const h = window.innerHeight
    document.querySelectorAll('.sr:not(.sr-in)').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < h * TRIGGER && r.bottom > 0) el.classList.add('sr-in')
    })
  }
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(revealVisible)
  }

  // 1) Balayage initial (Hero, Stats… déjà montés).
  scanArm(document.body)

  // 2) Fail-safe total : pas d'animation possible / onglet non peint → tout visible.
  if (!canAnimate || document.hidden) {
    revealAllPending()
  } else {
    revealVisible() // ce qui est déjà à l'écran au chargement
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  }

  // 3) Sections chargées en lazy : on les prépare puis on révèle celles déjà visibles.
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const added of m.addedNodes) scanArm(added)
    }
    if (!canAnimate || document.hidden) revealAllPending()
    else revealVisible()
  })
  mo.observe(document.body, { childList: true, subtree: true })

  // 4) Onglet en arrière-plan avant le scroll → on révèle le reste sans attendre.
  const onHide = () => { if (document.hidden) revealAllPending() }
  document.addEventListener('visibilitychange', onHide)

  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    mo.disconnect()
    document.removeEventListener('visibilitychange', onHide)
  }
}
