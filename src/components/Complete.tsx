interface Props {
  deckName: string
  totalQuestions: number
  blockNumber: number
  onRestart: () => void
}

export default function Complete({ deckName, totalQuestions, blockNumber, onRestart }: Props) {
  return (
    <div className="screen">
      <div className="card complete-card">
        <div className="complete-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="complete-title">Deck Mastered</h2>
        <p className="complete-deck">{deckName}</p>
        <div className="complete-stats">
          <div className="stat">
            <span className="stat-value">{totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat">
            <span className="stat-value">{blockNumber}</span>
            <span className="stat-label">Rounds</span>
          </div>
        </div>
        <button className="btn-primary" onClick={onRestart}>Study Another Deck</button>
      </div>
    </div>
  )
}
