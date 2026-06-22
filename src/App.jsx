import { useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import Footer from './components/Footer.jsx'
import StickyCTA from './components/StickyCTA.jsx'
import Modal from './components/Modal.jsx'
import CookieBanner from './components/CookieBanner.jsx'

const Probleme    = lazy(() => import('./components/Probleme.jsx'))
const Solution    = lazy(() => import('./components/Solution.jsx'))
const Histoire    = lazy(() => import('./components/Histoire.jsx'))
const BrvmLive    = lazy(() => import('./components/BrvmLive.jsx'))
const Calculateur      = lazy(() => import('./components/Calculateur.jsx'))
const CalculateurFiscal = lazy(() => import('./components/CalculateurFiscal.jsx'))
const LeadMagnet  = lazy(() => import('./components/LeadMagnet.jsx'))
const BlogPreview = lazy(() => import('./components/BlogPreview.jsx'))
const Temoignages = lazy(() => import('./components/Temoignages.jsx'))
const Pricing     = lazy(() => import('./components/Pricing.jsx'))
const FAQ         = lazy(() => import('./components/FAQ.jsx'))
const Cockpit     = lazy(() => import('./Cockpit.jsx'))
const BlogIndex   = lazy(() => import('./pages/BlogIndex.jsx'))
const BlogPost    = lazy(() => import('./pages/BlogPost.jsx'))
const NotFound    = lazy(() => import('./pages/NotFound.jsx'))

function LandingPage() {
  const [modal, setModal] = useState(null)

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Suspense fallback={null}>
          <Probleme />
          <Solution />
          <Histoire />
          <BrvmLive />
          <Calculateur />
          <CalculateurFiscal />
          <LeadMagnet />
          <BlogPreview />
          <Temoignages />
          <Pricing />
          <FAQ />
        </Suspense>
      </main>
      <Footer onOpenModal={setModal} />
      <StickyCTA />
      <Modal type={modal} onClose={() => setModal(null)} />
      <CookieBanner />
    </>
  )
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cockpit" element={<Cockpit />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
