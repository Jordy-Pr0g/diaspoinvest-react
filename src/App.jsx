import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import Probleme from './components/Probleme.jsx'
import Solution from './components/Solution.jsx'
import Histoire from './components/Histoire.jsx'
import BrvmLive from './components/BrvmLive.jsx'
import Calculateur from './components/Calculateur.jsx'
import LeadMagnet from './components/LeadMagnet.jsx'
import Temoignages from './components/Temoignages.jsx'
import Pricing from './components/Pricing.jsx'
import FAQ from './components/FAQ.jsx'
import Footer from './components/Footer.jsx'
import StickyCTA from './components/StickyCTA.jsx'
import Modal from './components/Modal.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import Cockpit from './Cockpit.jsx'
import BlogIndex from './pages/BlogIndex.jsx'
import BlogPost from './pages/BlogPost.jsx'

function LandingPage() {
  const [modal, setModal] = useState(null)
  const isCockpit = window.location.hash === '#cockpit'

  if (isCockpit) return <Cockpit />

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Probleme />
        <Solution />
        <Histoire />
        <BrvmLive />
        <Calculateur />
        <LeadMagnet />
        <Temoignages />
        <Pricing />
        <FAQ />
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
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
    </Routes>
  )
}
