import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CalculateurFiscal from '../components/CalculateurFiscal.jsx'
import { useMeta } from '../hooks/useMeta.js'

export default function Fiscalite() {
  useMeta({
    title: 'Calculateur fiscal BRVM — DiaspoInvest',
    description: 'Calcule ton imposition réelle sur les dividendes BRVM selon ton pays de résidence. Flat tax 31,4 % en France, IRVM à la source en UEMOA.',
    url: 'https://diaspoinvest.fr/fiscalite',
  })
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <CalculateurFiscal />
      </div>
      <Footer />
    </>
  )
}
