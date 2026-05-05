import type { Deck, QuizSession, SavedState } from './types'

function sessionKey(id: string) { return `stump_session_${id}` }
function completeKey(id: string) { return `stump_complete_${id}` }
function completeInfoKey(id: string) { return `stump_complete_info_${id}` }
function badgeKey(id: string) { return `stump_badges_${id}` }

export function loadSaved(deckId: string): SavedState | null {
  try {
    const raw = localStorage.getItem(sessionKey(deckId))
    if (!raw) return null
    const saved = JSON.parse(raw) as SavedState
    saved.session.masteredIds ??= []
    return saved
  } catch { return null }
}

export function saveSaved(deckId: string, state: SavedState) {
  localStorage.setItem(sessionKey(deckId), JSON.stringify(state))
}

export function clearSaved(deckId: string) { localStorage.removeItem(sessionKey(deckId)) }

export function isDeckComplete(deckId: string) { return localStorage.getItem(completeKey(deckId)) !== null }

export function getBadgeCount(deckId: string) { return parseInt(localStorage.getItem(badgeKey(deckId)) ?? '0', 10) }

export interface CompleteInfo {
  deckName: string
  totalQuestions: number
  blockNumber: number
}

export function markDeckComplete(deckId: string, info: CompleteInfo) {
  localStorage.setItem(completeKey(deckId), '1')
  localStorage.setItem(completeInfoKey(deckId), JSON.stringify(info))
  localStorage.setItem(badgeKey(deckId), String(getBadgeCount(deckId) + 1))
}

export function getCompleteInfo(deckId: string): CompleteInfo | null {
  try {
    const raw = localStorage.getItem(completeInfoKey(deckId))
    return raw ? (JSON.parse(raw) as CompleteInfo) : null
  } catch { return null }
}

export function clearDeckComplete(deckId: string) {
  localStorage.removeItem(completeKey(deckId))
  localStorage.removeItem(completeInfoKey(deckId))
}

export function freshSession(deck: Deck, deckId: string): QuizSession {
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
