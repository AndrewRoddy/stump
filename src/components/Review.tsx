import type { BlockResult } from '../App'

interface Props {
  results: BlockResult[]
  remainingInQueue: number
  blockNumber: number
  onContinue: () => void
}

export default function Review({ results, remainingInQueue, blockNumber, onContinue }: Props) {
  const correctCount = results.filter(r => r.correct).length
  const wrongCount = results.length - correctCount
  const addedBack = wrongCount * 2
  const totalRemaining = remainingInQueue + addedBack

  return (
    <div className="screen">
      <div className="card review-card">
        <h2 className="review-title">Round {blockNumber} Complete</h2>
        <div className="score-display">
          <span className="score-correct">{correctCount}</span>
          <span className="score-sep"> / </span>
          <span className="score-total">{results.length}</span>
        </div>

        <div className="results-list">
          {results.map((r, i) => (
            <div key={i} className={`result-item ${r.correct ? 'result-correct' : 'result-wrong'}`}>
              <span className="result-icon">{r.correct ? '✓' : '✗'}</span>
              <div className="result-details">
                <p className="result-question">{r.question.question}</p>
                {!r.correct && (
                  <p className="result-answer">
                    <span className="answer-wrong">You: {r.question.options[r.selected]}</span>
                    <span className="answer-correct"> · Correct: {r.question.options[r.question.correctAnswer]}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {wrongCount > 0 && (
          <p className="requeue-info">
            {wrongCount} wrong — added back twice ({addedBack} questions to review)
          </p>
        )}

        {totalRemaining > 0 ? (
          <p className="remaining-info">{totalRemaining} questions remaining</p>
        ) : (
          <p className="remaining-info all-done">All questions mastered!</p>
        )}

        <button className="btn-primary" onClick={onContinue}>
          {totalRemaining > 0 ? 'Continue' : 'Finish'}
        </button>
      </div>
    </div>
  )
}
