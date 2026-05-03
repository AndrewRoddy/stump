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
    <div className="screen">
      <div className="card">
        <h1 className="title">Quiz App</h1>
        <p className="subtitle">Choose a deck to study</p>
        {decks.length === 0 ? (
          <p className="empty">No decks found. Add JSON files to src/decks/</p>
        ) : (
          <div className="deck-list">
            {sortedFolders.map(folder => (
              <div key={folder || '__root__'}>
                {folder && <p className="folder-label">{folder}</p>}
                {grouped[folder].map(({ id, deck }) => (
                  <button key={id} className="deck-card" onClick={() => onSelect(deck)}>
                    <span className="deck-name">{deck.name}</span>
                    <span className="deck-meta">
                      {deck.questions.length} questions
                      {deck.description ? ` · ${deck.description}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
