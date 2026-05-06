import type { BlockResult } from '../types'

interface Props {
  results: BlockResult[]
  remainingInQueue: number
  blockNumber: number
  onContinue: () => void
}

export default function Review({ results, remainingInQueue, blockNumber, onContinue }: Props) {
  const correctCount = results.filter(r => r.correct).length
  const wrongCount = results.length - correctCount
  const totalRemaining = remainingInQueue + wrongCount * 2
  const sorted = [...results].sort((a, b) => (a.correct ? 1 : 0) - (b.correct ? 1 : 0))

  return (
    <div className="screen">
      <div className="card review-card">
        <h2 className="review-title">Round {blockNumber} Complete</h2>
        <div className="score-display">
          <span className="score-correct">{correctCount}</span>
          <span className="score-sep"> / </span>
          <span className="score-total">{results.length}</span>
        </div>

        <button className="btn-primary" onClick={onContinue}>
          {totalRemaining > 0 ? 'Continue' : 'Finish'}
        </button>

        <div className="results-list">
          {sorted.map((r, i) => (
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
                {r.question.explanation && (
                  <p className="result-explanation">{r.question.explanation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
