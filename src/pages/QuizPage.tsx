import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { DeckEntry, QuizSession } from '../types'
import Quiz from '../components/Quiz'
import Review from '../components/Review'
import {
  loadSaved, saveSaved, clearSaved,
  isDeckComplete, markDeckComplete,
  freshSession,
} from '../storage'

export default function QuizPage({ allDecks }: { allDecks: DeckEntry[] }) {
  const deckId = useParams()['*'] ?? ''
  const navigate = useNavigate()

  const [session, setSession] = useState<QuizSession | null>(null)
  const [phase, setPhase] = useState<'quizzing' | 'reviewing'>('quizzing')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [awaitingCorrect, setAwaitingCorrect] = useState(false)

  useEffect(() => {
    const entry = allDecks.find(d => d.id === deckId)
    const folderEntries = !entry ? allDecks.filter(d => d.id.startsWith(deckId + '/')) : []

    if (!entry && folderEntries.length === 0) { navigate('/', { replace: true }); return }

    const deck = entry
      ? entry.deck
      : { name: deckId.split('/').slice(-1)[0] ?? deckId, questions: folderEntries.flatMap(e => e.deck.questions) }

    if (isDeckComplete(deckId)) { navigate(`/complete/${deckId}`, { replace: true }); return }

    const saved = loadSaved(deckId)
    if (saved) {
      setSession(saved.session)
      setCurrentIndex(saved.currentIndex)
      setPhase(saved.phase)
    } else {
      setSession(freshSession(deck, deckId))
      setCurrentIndex(0)
      setPhase('quizzing')
    }
    setSelectedAnswer(null)
    setAwaitingCorrect(false)
  }, [deckId])

  useEffect(() => {
    if (!session || (phase !== 'quizzing' && phase !== 'reviewing')) return
    saveSaved(deckId, { session, currentIndex, phase })
  }, [session, currentIndex, phase])

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
    const newResult = { question, selected: answerIndex, correct }

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
      markDeckComplete(session.deckId, {
        deckName: session.deckName,
        totalQuestions: session.totalQuestions,
        blockNumber: session.blockNumber,
      })
      clearSaved(session.deckId)
      navigate(`/complete/${session.deckId}`)
      return
    }

    newQueue.sort(() => Math.random() - 0.5)
    const block = newQueue.splice(0, 10)
    setSession({ ...session, queue: newQueue, currentBlock: block, blockResults: [], blockNumber: session.blockNumber + 1 })
    setCurrentIndex(0)
    setPhase('quizzing')
  }

  if (!session) return null

  if (phase === 'quizzing') {
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

  return (
    <Review
      results={session.blockResults}
      remainingInQueue={session.queue.length}
      blockNumber={session.blockNumber}
      onContinue={handleContinue}
    />
  )
}
