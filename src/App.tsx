import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import type { Deck, DeckEntry } from './types'
import DeckSelect from './components/DeckSelect'
import QuizPage from './pages/QuizPage'
import CompletePage from './pages/CompletePage'
import { isDeckComplete, getBadgeCount, clearDeckComplete, clearSaved } from './storage'

export interface PatreonUser {
  id: string
  name: string
  avatar: string | null
  email: string | null
}

function getStoredUser(): PatreonUser | null {
  try {
    const raw = localStorage.getItem('stump_patreon_user')
    return raw ? (JSON.parse(raw) as PatreonUser) : null
  } catch { return null }
}

function storeUser(user: PatreonUser) {
  localStorage.setItem('stump_patreon_user', JSON.stringify(user))
}

function clearStoredUser() {
  localStorage.removeItem('stump_patreon_user')
}

const deckModules = import.meta.glob<Deck>('../decks/**/*.json', { eager: true, import: 'default' })

const allDecks: DeckEntry[] = Object.entries(deckModules).map(([path, deck]) => {
  const relative = path.replace('../decks/', '').replace('.json', '')
  const slashIndex = relative.lastIndexOf('/')
  const folder = slashIndex !== -1 ? relative.slice(0, slashIndex) : ''
  return { id: relative, folder, deck }
})

function SelectingPage() {
  const navigate = useNavigate()
  const [patreonUser, setPatreonUser] = useState<PatreonUser | null>(getStoredUser)
  const [pendingRestart, setPendingRestart] = useState<{ deck: Deck; id: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('patreon_user')
    if (encoded) {
      try {
        const user = JSON.parse(atob(decodeURIComponent(encoded))) as PatreonUser
        setPatreonUser(user)
        storeUser(user)
      } catch { /* malformed payload */ }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleSelect(deck: Deck, deckId: string) {
    if (isDeckComplete(deckId)) {
      setPendingRestart({ deck, id: deckId })
      return
    }
    navigate(`/quiz/${deckId}`)
  }

  function confirmRestart() {
    if (!pendingRestart) return
    clearDeckComplete(pendingRestart.id)
    clearSaved(pendingRestart.id)
    setPendingRestart(null)
    navigate(`/quiz/${pendingRestart.id}`)
  }

  return (
    <>
      <DeckSelect
        decks={allDecks}
        onSelect={handleSelect}
        patreonUser={patreonUser}
        onSignOut={() => { setPatreonUser(null); clearStoredUser() }}
      />
      {pendingRestart && (() => {
        const count = getBadgeCount(pendingRestart.id)
        const tierLabel = count >= 100 ? 'Diamond' : count >= 10 ? 'Gold' : count >= 2 ? 'Silver' : 'Bronze'
        const nextHint = count >= 100
          ? "You've reached the max tier — keep going!"
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectingPage />} />
        <Route path="/quiz/*" element={<QuizPage allDecks={allDecks} />} />
        <Route path="/complete/*" element={<CompletePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
