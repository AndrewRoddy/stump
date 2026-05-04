import { useMemo } from 'react'
import type { Question } from '../types'

const LABELS = ['A', 'B', 'C', 'D'] as const

interface Props {
  question: Question
  questionNumber: number
  totalInBlock: number
  deckName: string
  selectedAnswer: number | null
  awaitingCorrect: boolean
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
  selectedAnswer,
  awaitingCorrect,
  onAnswer,
}: Props) {

  const shuffledIndices = useMemo(() => {
    const indices = question.options.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [question])

  const shuffledSelected = selectedAnswer !== null ? shuffledIndices.indexOf(selectedAnswer) : null
  const shuffledCorrect = shuffledIndices.indexOf(question.correctAnswer)

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
          {shuffledIndices.map((origIdx, i) => (
            <button
              key={i}
              className={getOptionClass(i, shuffledSelected, shuffledCorrect)}
              onClick={() => onAnswer(origIdx)}
              disabled={selectedAnswer !== null && !(awaitingCorrect && origIdx === question.correctAnswer)}
            >
              <span className="option-label">{LABELS[i]}</span>
              <span className="option-text">{question.options[origIdx]}</span>
            </button>
          ))}
        </div>
        {awaitingCorrect && (
          <p className="correct-hint">Click the correct answer to continue</p>
        )}
      </div>
    </div>
  )
}
