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
