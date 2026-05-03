import type { Deck } from '../types'

interface Props {
  decks: { id: string; deck: Deck }[]
  onSelect: (deck: Deck) => void
}

export default function DeckSelect({ decks, onSelect }: Props) {
  return (
    <div className="screen">
      <div className="card">
        <h1 className="title">Quiz App</h1>
        <p className="subtitle">Choose a deck to study</p>
        <div className="deck-list">
          {decks.length === 0 ? (
            <p className="empty">No decks found. Add JSON files to src/decks/</p>
          ) : (
            decks.map(({ id, deck }) => (
              <button key={id} className="deck-card" onClick={() => onSelect(deck)}>
                <span className="deck-name">{deck.name}</span>
                <span className="deck-meta">
                  {deck.questions.length} questions
                  {deck.description ? ` · ${deck.description}` : ''}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
