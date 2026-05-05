export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
}

export interface Deck {
  name: string;
  description?: string;
  questions: Question[];
}

export interface BlockResult {
  question: Question
  selected: number
  correct: boolean
}

export interface QuizSession {
  deckId: string
  deckName: string
  queue: Question[]
  currentBlock: Question[]
  blockResults: BlockResult[]
  totalQuestions: number
  blockNumber: number
  masteredIds: string[]
}

export interface SavedState {
  session: QuizSession
  currentIndex: number
  phase: 'quizzing' | 'reviewing'
}

export interface DeckEntry {
  id: string
  folder: string
  deck: Deck
}
