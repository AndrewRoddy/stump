import type { Deck } from '../types'

interface DeckEntry {
  id: string
  folder: string
  deck: Deck
}

interface Props {
  decks: DeckEntry[]
  onSelect: (deck: Deck) => void
}

export default function DeckSelect({ decks, onSelect }: Props) {
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
    <div className="deck-screen">
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
              const mergedDeck = {
                name: folder,
                questions: entries.flatMap(e => e.deck.questions),
              }
              return (
                <div key={folder || '__root__'} className="folder-group">
                  {folder && (
                    <button className="folder-label" onClick={() => onSelect(mergedDeck)}>
                      {folder}
                      <span className="folder-label-right">
                        {mergedDeck.questions.length} questions
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </button>
                  )}
                  {entries.map(({ id, deck }) => (
                    <button key={id} className="deck-card" onClick={() => onSelect(deck)}>
                      <span className="deck-name">{deck.name}</span>
                      <span className="deck-meta">
                        {deck.questions.length} questions
                        {deck.description ? ` · ${deck.description}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
