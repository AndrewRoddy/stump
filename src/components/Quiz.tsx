import type { Question } from '../types'

const LABELS = ['A', 'B', 'C', 'D'] as const

interface Props {
  question: Question
  questionNumber: number
  totalInBlock: number
  deckName: string
  selectedAnswer: number | null
  onAnswer: (index: number) => void
}

function getOptionClass(i: number, selected: number | null, correct: number): string {
  if (selected === null) return 'option'
  if (i === correct) return 'option correct'
  if (i === selected) return 'option wrong'
  return 'option dimmed'
}

export default function Quiz({
  question,
  questionNumber,
  totalInBlock,
  deckName,
  selectedAnswer,
  onAnswer,
}: Props) {
  const progressPct = ((questionNumber - 1) / totalInBlock) * 100

  return (
    <div className="screen">
      <div className="card quiz-card">
        {/*
        <div className="quiz-header">
          <span className="deck-label">{deckName}</span>
          <span className="progress-label">{questionNumber} / {totalInBlock}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        */}
        <p className="question-text">{question.question}</p>
        <div className="options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={getOptionClass(i, selectedAnswer, question.correctAnswer)}
              onClick={() => onAnswer(i)}
              disabled={selectedAnswer !== null}
            >
              <span className="option-label">{LABELS[i]}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
