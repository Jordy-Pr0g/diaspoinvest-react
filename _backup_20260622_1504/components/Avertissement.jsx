import { DISCLAIMER } from '../data.js'

export default function Avertissement() {
  return (
    <section className="avertissement" id="avertissement">
      <div className="container">
        <div className="avert-box">
          <div>
            <h3>Avertissement légal</h3>
            <p>{DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
