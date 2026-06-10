import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import Probleme from './components/Probleme.jsx'
import Solution from './components/Solution.jsx'
import Calculateur from './components/Calculateur.jsx'
import Avertissement from './components/Avertissement.jsx'
import Pricing from './components/Pricing.jsx'
import FAQ from './components/FAQ.jsx'
import Footer from './components/Footer.jsx'
import StickyCTA from './components/StickyCTA.jsx'
import Modal from './components/Modal.jsx'

export default function App() {
  // null | 'mentions' | 'confidentialite'
  const [modal, setModal] = useState(null)

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Probleme />
        <Solution />
        <Calculateur />
        <Avertissement />
        <Pricing />
        <FAQ />
      </main>
      <Footer onOpenModal={setModal} />
      <StickyCTA />
      <Modal type={modal} onClose={() => setModal(null)} />
    </>
  )
}
