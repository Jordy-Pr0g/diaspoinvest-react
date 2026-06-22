import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CalculateurFiscal from '../components/CalculateurFiscal.jsx'

export default function Fiscalite() {
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
