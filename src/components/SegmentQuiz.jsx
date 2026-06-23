export default function SegmentQuiz({ onComplete }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#0D1525',
        padding: '40px',
        borderRadius: '12px',
        maxWidth: '500px',
        color: '#E8EEF6'
      }}>
        <h2>QUIZ TEST - Visible?</h2>
        <p>Si tu vois ça, le quiz fonctionne!</p>
        <button onClick={() => onComplete()} style={{ padding: '10px 20px', background: '#C9A84C', color: '#000', border: 'none', cursor: 'pointer' }}>
          Fermer
        </button>
      </div>
    </div>
  )
}
