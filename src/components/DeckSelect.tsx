import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Deck } from '../types'
import type { PatreonUser } from '../App'

interface DeckEntry {
  id: string
  folder: string
  deck: Deck
}

interface Props {
  decks: DeckEntry[]
  onSelect: (deck: Deck, id: string) => void
  patreonUser: PatreonUser | null
  onSignOut: () => void
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
  if (p.status !== 'in-progress') return {}
  return { '--deck-progress': `${p.pct}%` } as CSSProperties
}

function folderProgressStyle(p: DeckProgress): CSSProperties {
  if (p.status !== 'in-progress') return {}
  const fill = `rgba(255,146,47,0.22) ${p.pct}%`
  const base = `rgba(255,146,47,0.07) ${p.pct}%`
  return { background: `linear-gradient(to right, ${fill}, ${base})` }
}

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond'

const BADGE_SHAPE: Record<BadgeTier, string> = {
  bronze:  '●',
  silver:  '■',
  gold:    '★',
  diamond: '◆',
}

const BADGE_INFO: Record<BadgeTier, { label: string; req: string; description: string }> = {
  bronze:  { label: 'Bronze',  req: '1 completion',   description: 'Awarded for completing a deck for the first time.' },
  silver:  { label: 'Silver',  req: '2 completions',  description: 'Awarded for completing a deck twice.' },
  gold:    { label: 'Gold',    req: '10 completions', description: 'Awarded for completing a deck 10 times.' },
  diamond: { label: 'Diamond', req: '100 completions', description: 'Awarded for completing a deck 100 times. Legendary.' },
}

function getDeckBadgeTier(id: string): BadgeTier | null {
  const count = parseInt(localStorage.getItem(`stump_badges_${id}`) ?? '0', 10)
  if (count >= 100) return 'diamond'
  if (count >= 10)  return 'gold'
  if (count >= 2)   return 'silver'
  if (count >= 1)   return 'bronze'
  return null
}

function clearAllProgress() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('stump_'))
    .forEach(k => localStorage.removeItem(k))
}

export default function DeckSelect({ decks, onSelect, patreonUser, onSignOut }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [badgePopup, setBadgePopup] = useState<{ tier: BadgeTier; count: number } | null>(null)

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
          {patreonUser && (
            <div className="auth-row">
              <div className="user-pill">
                {patreonUser.avatar
                  ? <img className="user-avatar" src={patreonUser.avatar} alt="" />
                  : <span className="user-initials">{patreonUser.name.charAt(0).toUpperCase()}</span>
                }
                <span className="user-name">{patreonUser.name}</span>
                <button className="btn-sign-out" onClick={onSignOut}>Sign out</button>
              </div>
            </div>
          )}
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
                    {folder && (() => {
                      const folderTier = getDeckBadgeTier(folder)
                      const folderBadgeCount = folderTier ? parseInt(localStorage.getItem(`stump_badges_${folder}`) ?? '0', 10) : 0
                      return (
                        <button
                          className="folder-label"
                          style={folderProgressStyle(folderProgress)}
                          onClick={() => onSelect(mergedDeck, folder)}
                        >
                          <span className="folder-label-left">
                            {folderTier && (
                              <span
                                className={`deck-badge-icon deck-badge-icon-${folderTier}`}
                                onClick={e => { e.stopPropagation(); setBadgePopup({ tier: folderTier, count: folderBadgeCount }) }}
                                title={BADGE_INFO[folderTier].label}
                              >
                                {BADGE_SHAPE[folderTier]}
                              </span>
                            )}
                            {folder}
                          </span>
                          <span className="folder-label-right">
                            {mergedDeck.questions.length} questions
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </span>
                        </button>
                      )
                    })()}
                    {entries.map(({ id, deck }) => {
                      const p = getDeckProgress(id)
                      const tier = getDeckBadgeTier(id)
                      const count = tier ? parseInt(localStorage.getItem(`stump_badges_${id}`) ?? '0', 10) : 0
                      return (
                        <button
                          key={id}
                          className="deck-card"
                          style={cardProgressStyle(p)}
                          onClick={() => onSelect(deck, id)}
                        >
                          <span className="deck-name-row">
                            {tier && (
                              <span
                                className={`deck-badge-icon deck-badge-icon-${tier}`}
                                onClick={e => { e.stopPropagation(); setBadgePopup({ tier, count }) }}
                                title={BADGE_INFO[tier].label}
                              >
                                {BADGE_SHAPE[tier]}
                              </span>
                            )}
                            <span className="deck-name">{deck.name}</span>
                          </span>
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

      {badgePopup && (
        <div className="modal-overlay" onClick={() => setBadgePopup(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="badge-popup-header">
              <h3 className="modal-title">Badges</h3>
              <span className="badge-popup-count">{badgePopup.count} completion{badgePopup.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="badge-tier-list">
              {(Object.keys(BADGE_INFO) as BadgeTier[]).map(tier => (
                <div key={tier} className={`badge-tier-row${tier === badgePopup.tier ? ' badge-tier-earned' : ''}`}>
                  <span className={`badge-tier-shape deck-badge-icon-${tier}`}>{BADGE_SHAPE[tier]}</span>
                  <div className="badge-tier-text">
                    <span className="badge-tier-label">{BADGE_INFO[tier].label}</span>
                    <span className="badge-tier-req">{BADGE_INFO[tier].req}</span>
                  </div>
                  {tier === badgePopup.tier && <span className="badge-tier-earned-tag">Earned</span>}
                </div>
              ))}
            </div>
            <button className="btn-ghost" onClick={() => setBadgePopup(null)}>Got it</button>
          </div>
        </div>
      )}

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
