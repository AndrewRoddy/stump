import { useState, useEffect } from 'react'
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
  deckId: string
  deckName: string
  queue: Question[]
  currentBlock: Question[]
  blockResults: BlockResult[]
  totalQuestions: number
  blockNumber: number
  masteredIds: string[]
}

interface SavedState {
  session: QuizSession
  currentIndex: number
  phase: 'quizzing' | 'reviewing'
}

function sessionKey(deckId: string) { return `stump_session_${deckId}` }
function completeKey(deckId: string) { return `stump_complete_${deckId}` }
function badgeKey(deckId: string) { return `stump_badges_${deckId}` }

function loadSaved(deckId: string): SavedState | null {
  try {
    const raw = localStorage.getItem(sessionKey(deckId))
    if (!raw) return null
    const saved = JSON.parse(raw) as SavedState
    saved.session.masteredIds ??= []
    return saved
  } catch { return null }
}

function clearSaved(deckId: string) { localStorage.removeItem(sessionKey(deckId)) }
function isDeckComplete(deckId: string) { return localStorage.getItem(completeKey(deckId)) !== null }
function getBadgeCount(deckId: string) { return parseInt(localStorage.getItem(badgeKey(deckId)) ?? '0', 10) }
function markDeckComplete(deckId: string) {
  localStorage.setItem(completeKey(deckId), '1')
  localStorage.setItem(badgeKey(deckId), String(getBadgeCount(deckId) + 1))
}
function clearDeckComplete(deckId: string) { localStorage.removeItem(completeKey(deckId)) }

function freshSession(deck: Deck, deckId: string): QuizSession {
  const shuffled = [...deck.questions].sort(() => Math.random() - 0.5)
  const block = shuffled.splice(0, 10)
  return {
    deckId,
    deckName: deck.name,
    queue: shuffled,
    currentBlock: block,
    blockResults: [],
    totalQuestions: deck.questions.length,
    blockNumber: 1,
    masteredIds: [],
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('selecting')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [awaitingCorrect, setAwaitingCorrect] = useState(false)
  const [pendingRestart, setPendingRestart] = useState<{ deck: Deck; id: string } | null>(null)

  useEffect(() => {
    if (!session || (phase !== 'quizzing' && phase !== 'reviewing')) return
    const saved: SavedState = { session, currentIndex, phase }
    localStorage.setItem(sessionKey(session.deckId), JSON.stringify(saved))
  }, [session, currentIndex, phase])

  function startQuiz(deck: Deck, deckId: string) {
    if (isDeckComplete(deckId)) {
      setPendingRestart({ deck, id: deckId })
      return
    }
    const saved = loadSaved(deckId)
    if (saved) {
      setSession(saved.session)
      setCurrentIndex(saved.currentIndex)
      setSelectedAnswer(null)
      setAwaitingCorrect(false)
      setPhase(saved.phase)
      return
    }
    setSession(freshSession(deck, deckId))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAwaitingCorrect(false)
    setPhase('quizzing')
  }

  function confirmRestart() {
    if (!pendingRestart) return
    const { deck, id } = pendingRestart
    clearDeckComplete(id)
    clearSaved(id)
    setPendingRestart(null)
    setSession(freshSession(deck, id))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAwaitingCorrect(false)
    setPhase('quizzing')
  }

  function handleAnswer(answerIndex: number) {
    if (!session) return

    const question = session.currentBlock[currentIndex]
    const isLastQuestion = currentIndex + 1 >= session.currentBlock.length

    if (awaitingCorrect) {
      if (answerIndex !== question.correctAnswer) return
      setAwaitingCorrect(false)
      setSelectedAnswer(null)
      if (isLastQuestion) setPhase('reviewing')
      else setCurrentIndex(i => i + 1)
      return
    }

    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)

    const correct = answerIndex === question.correctAnswer
    const newResult: BlockResult = { question, selected: answerIndex, correct }

    if (!correct) {
      setSession(prev => prev ? { ...prev, blockResults: [...prev.blockResults, newResult] } : prev)
      setAwaitingCorrect(true)
    } else {
      setTimeout(() => {
        setSession(prev => {
          if (!prev) return prev
          const existing = prev.masteredIds ?? []
          const masteredIds = existing.includes(question.id) ? existing : [...existing, question.id]
          return { ...prev, blockResults: [...prev.blockResults, newResult], masteredIds }
        })
        setSelectedAnswer(null)
        if (isLastQuestion) setPhase('reviewing')
        else setCurrentIndex(i => i + 1)
      }, 1200)
    }
  }

  function handleContinue() {
    if (!session) return

    const newQueue = [...session.queue]
    for (const result of session.blockResults) {
      if (!result.correct) newQueue.push(result.question, result.question)
    }

    if (newQueue.length === 0) {
      markDeckComplete(session.deckId)
      clearSaved(session.deckId)
      setPhase('complete')
      return
    }

    newQueue.sort(() => Math.random() - 0.5)
    const block = newQueue.splice(0, 10)
    setSession({ ...session, queue: newQueue, currentBlock: block, blockResults: [], blockNumber: session.blockNumber + 1 })
    setCurrentIndex(0)
    setPhase('quizzing')
  }

  function handleRestart() {
    setPhase('selecting')
    setSession(null)
  }

  if (phase === 'selecting') {
    return (
      <>
        <DeckSelect decks={allDecks} onSelect={startQuiz} />
        {pendingRestart && (() => {
          const count = getBadgeCount(pendingRestart.id)
          const tierLabel = count >= 100 ? 'Diamond' : count >= 10 ? 'Gold' : count >= 2 ? 'Silver' : 'Bronze'
          const nextHint = count >= 100
            ? 'You\'ve reached the max tier — keep going!'
            : count >= 10
            ? `Play again ${100 - count} more time${100 - count === 1 ? '' : 's'} for Diamond!`
            : count >= 2
            ? `Play again ${10 - count} more time${10 - count === 1 ? '' : 's'} for Gold!`
            : 'Play again 1 more time for Silver!'
          return (
            <div className="modal-overlay" onClick={() => setPendingRestart(null)}>
              <div className="modal-card" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Deck Complete</h3>
                <p className="modal-body">
                  You've mastered <strong>{pendingRestart.deck.name}</strong> and earned a {tierLabel} badge. {nextHint}
                </p>
                <div className="modal-actions">
                  <button className="btn-ghost" onClick={() => setPendingRestart(null)}>Cancel</button>
                  <button className="btn-primary" onClick={confirmRestart}>Play Again</button>
                </div>
              </div>
            </div>
          )
        })()}
      </>
    )
  }

  if (phase === 'quizzing' && session) {
    return (
      <Quiz
        question={session.currentBlock[currentIndex]}
        questionNumber={currentIndex + 1}
        totalInBlock={session.currentBlock.length}
        deckName={session.deckName}
        selectedAnswer={selectedAnswer}
        awaitingCorrect={awaitingCorrect}
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
        badgeCount={getBadgeCount(session.deckId)}
        onRestart={handleRestart}
      />
    )
  }

  return null
}
