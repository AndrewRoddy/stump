import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Deck } from '../types'

interface DeckEntry {
  id: string
  folder: string
  deck: Deck
}

interface Props {
  decks: DeckEntry[]
  onSelect: (deck: Deck, id: string) => void
}

interface DeckProgress {
  status: 'none' | 'in-progress' | 'complete'
  pct: number
}

function getDeckProgress(id: string): DeckProgress {
  if (localStorage.getItem(`stump_complete_${id}`)) {
    return { status: 'complete', pct: 100 }
  }
  try {
    const raw = localStorage.getItem(`stump_session_${id}`)
    if (!raw) return { status: 'none', pct: 0 }
    const saved = JSON.parse(raw) as { session: { masteredIds?: string[]; totalQuestions: number } }
    const { masteredIds = [], totalQuestions } = saved.session
    if (!totalQuestions) return { status: 'none', pct: 0 }
    return { status: 'in-progress', pct: Math.round((masteredIds.length / totalQuestions) * 100) }
  } catch {
    return { status: 'none', pct: 0 }
  }
}

function cardProgressStyle(p: DeckProgress): CSSProperties {
  if (p.status === 'none') return {}
  return { '--deck-progress': `${p.pct}%` } as CSSProperties
}

function folderProgressStyle(p: DeckProgress): CSSProperties {
  if (p.status === 'none') return {}
  const fill = `rgba(255,146,47,0.22) ${p.pct}%`
  const base = `rgba(255,146,47,0.07) ${p.pct}%`
  return { background: `linear-gradient(to right, ${fill}, ${base})` }
}

function clearAllProgress() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('stump_'))
    .forEach(k => localStorage.removeItem(k))
}

export default function DeckSelect({ decks, onSelect }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetCount, setResetCount] = useState(0)

  function handleResetAll() {
    clearAllProgress()
    setShowConfirm(false)
    setResetCount(n => n + 1)
  }

  const grouped = decks.reduce<Record<string, DeckEntry[]>>((acc, entry) => {
    const key = entry.folder || ''
    ;(acc[key] ??= []).push(entry)
    return acc
  }, {})

  const sortedFolders = Object.keys(grouped).sort((a, b) => {
    if (a === '') return -1
    if (b === '') return 1
    return a.localeCompare(b)
  })

  return (
    <>
      <div className="deck-screen" key={resetCount}>
        <header className="deck-header">
          <h1 className="app-title">Stump</h1>
          <p className="app-subtitle">Choose a deck to study</p>
        </header>
        <div className="deck-body">
          {decks.length === 0 ? (
            <p className="empty">No decks found. Add JSON files to src/decks/</p>
          ) : (
            <div className="deck-list">
              {sortedFolders.map(folder => {
                const entries = grouped[folder]
                const mergedDeck = { name: folder, questions: entries.flatMap(e => e.deck.questions) }
                const folderProgress = getDeckProgress(folder)
                return (
                  <div key={folder || '__root__'} className="folder-group">
                    {folder && (
                      <button
                        className="folder-label"
                        style={folderProgressStyle(folderProgress)}
                        onClick={() => onSelect(mergedDeck, folder)}
                      >
                        {folder}
                        <span className="folder-label-right">
                          {mergedDeck.questions.length} questions
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </button>
                    )}
                    {entries.map(({ id, deck }) => {
                      const p = getDeckProgress(id)
                      return (
                        <button
                          key={id}
                          className="deck-card"
                          style={cardProgressStyle(p)}
                          onClick={() => onSelect(deck, id)}
                        >
                          <span className="deck-name">{deck.name}</span>
                          <span className="deck-meta">
                            {deck.questions.length} questions
                            {deck.description ? ` · ${deck.description}` : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
          <div className="reset-all-row">
            <button className="btn-reset-all" onClick={() => setShowConfirm(true)}>
              Reset All Progress
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Reset All Progress</h3>
            <p className="modal-body">
              This will clear your progress on every deck. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleResetAll}>Reset All</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
