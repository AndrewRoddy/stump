import { useState } from 'react'
import type { Deck, Question } from './types'
import DeckSelect from './components/DeckSelect'
import Quiz from './components/Quiz'
import Review from './components/Review'
import Complete from './components/Complete'

const deckModules = import.meta.glob<Deck>('../decks/**/*.json', { eager: true, import: 'default' })

const allDecks = Object.entries(deckModules).map(([path, deck]) => {
  const relative = path.replace('../decks/', '').replace('.json', '')
  const slashIndex = relative.lastIndexOf('/')
  const folder = slashIndex !== -1 ? relative.slice(0, slashIndex) : ''
  return { id: relative, folder, deck }
})

type Phase = 'selecting' | 'quizzing' | 'reviewing' | 'complete'

export interface BlockResult {
  question: Question
  selected: number
  correct: boolean
}

interface QuizSession {
  deckName: string
  queue: Question[]
  currentBlock: Question[]
  blockResults: BlockResult[]
  totalQuestions: number
  blockNumber: number
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('selecting')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  function startQuiz(deck: Deck) {
    const shuffled = [...deck.questions].sort(() => Math.random() - 0.5)
    const block = shuffled.splice(0, 10)
    setSession({
      deckName: deck.name,
      queue: shuffled,
      currentBlock: block,
      blockResults: [],
      totalQuestions: deck.questions.length,
      blockNumber: 1,
    })
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setPhase('quizzing')
  }

  function handleAnswer(answerIndex: number) {
    if (selectedAnswer !== null || !session) return
    setSelectedAnswer(answerIndex)

    const question = session.currentBlock[currentIndex]
    const correct = answerIndex === question.correctAnswer
    const newResult: BlockResult = { question, selected: answerIndex, correct }
    const isLastQuestion = currentIndex + 1 >= session.currentBlock.length

    setTimeout(() => {
      if (isLastQuestion) {
        setSession(prev => prev ? { ...prev, blockResults: [...prev.blockResults, newResult] } : prev)
        setPhase('reviewing')
        setSelectedAnswer(null)
      } else {
        setSession(prev => prev ? { ...prev, blockResults: [...prev.blockResults, newResult] } : prev)
        setCurrentIndex(i => i + 1)
        setSelectedAnswer(null)
      }
    }, 1200)
  }

  function handleContinue() {
    if (!session) return

    const newQueue = [...session.queue]
    for (const result of session.blockResults) {
      if (!result.correct) {
        newQueue.push(result.question, result.question)
      }
    }

    if (newQueue.length === 0) {
      setPhase('complete')
      return
    }

    const block = newQueue.splice(0, 10)
    setSession({
      ...session,
      queue: newQueue,
      currentBlock: block,
      blockResults: [],
      blockNumber: session.blockNumber + 1,
    })
    setCurrentIndex(0)
    setPhase('quizzing')
  }

  function handleRestart() {
    setPhase('selecting')
    setSession(null)
  }

  if (phase === 'selecting') {
    return <DeckSelect decks={allDecks} onSelect={startQuiz} />
  }

  if (phase === 'quizzing' && session) {
    return (
      <Quiz
        question={session.currentBlock[currentIndex]}
        questionNumber={currentIndex + 1}
        totalInBlock={session.currentBlock.length}
        deckName={session.deckName}
        selectedAnswer={selectedAnswer}
        onAnswer={handleAnswer}
      />
    )
  }

  if (phase === 'reviewing' && session) {
    return (
      <Review
        results={session.blockResults}
        remainingInQueue={session.queue.length}
        blockNumber={session.blockNumber}
        onContinue={handleContinue}
      />
    )
  }

  if (phase === 'complete' && session) {
    return (
      <Complete
        deckName={session.deckName}
        totalQuestions={session.totalQuestions}
        blockNumber={session.blockNumber}
        onRestart={handleRestart}
      />
    )
  }

  return null
}
