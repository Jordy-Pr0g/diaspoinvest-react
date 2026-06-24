import { useState, lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import Footer from './components/Footer.jsx'
import StickyCTA from './components/StickyCTA.jsx'
import Modal from './components/Modal.jsx'
import SegmentQuiz from './components/SegmentQuiz.jsx'

const Probleme    = lazy(() => import('./components/Probleme.jsx'))
const Histoire    = lazy(() => import('./components/Histoire.jsx'))
const Calculateur = lazy(() => import('./components/Calculateur.jsx'))
const Temoignages = lazy(() => import('./components/Temoignages.jsx'))
const FAQ         = lazy(() => import('./components/FAQ.jsx'))
const LeadMagnet  = lazy(() => import('./components/LeadMagnet.jsx'))
const Pricing     = lazy(() => import('./components/Pricing.jsx'))
const APropos     = lazy(() => import('./pages/APropos.jsx'))
const BlogIndex   = lazy(() => import('./pages/BlogIndex.jsx'))
const BlogPost    = lazy(() => import('./pages/BlogPost.jsx'))
const Screener    = lazy(() => import('./pages/Screener.jsx'))
const Backtest    = lazy(() => import('./pages/Backtest.jsx'))
const Guides      = lazy(() => import('./pages/Guides.jsx'))
const Fiscalite   = lazy(() => import('./pages/Fiscalite.jsx'))
const NotFound    = lazy(() => import('./pages/NotFound.jsx'))

function LandingPage() {
  const [modal, setModal] = useState(null)
  const [showQuiz, setShowQuiz] = useState(true)

  return (
    <>
      {showQuiz && <SegmentQuiz onComplete={() => setShowQuiz(false)} />}
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Suspense fallback={null}>
          <Probleme />
          <Histoire />
          <Calculateur />
          <Temoignages />
          <FAQ />
          <LeadMagnet />
          <Pricing />
        </Suspense>
      </main>
      <Footer onOpenModal={setModal} />
      <StickyCTA />
      <Modal type={modal} onClose={() => setModal(null)} />
    </>
  )
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/screener" element={<Screener />} />
        <Route path="/backtest" element={<Backtest />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/fiscalite" element={<Fiscalite />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
