# Quiz Card Generation Instructions

## Answer Length Randomization

When generating a quiz card make sure the other 3 options are a plausible answer that could trick even a knowledgeable person.
Do not use m dashes in your questions or answers.

## Output Format

Cards must be written as JSON matching this schema and placed in the appropriate subfolder under `decks/`:

```json
{
  "name": "Deck Name",
  "description": "Optional short description",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}
```

`correctAnswer` is the zero-based index into `options` of the correct answer.

## Source Material

When prompted to generate cards from the data in this folder, read the relevant files in `data/` (PDFs, markdown notes, etc.) and base questions on their content. Organize output decks into subfolders under `decks/` that mirror the subject folder in `data/` (e.g., material from `data/Philosophy/` → `decks/Philosophy/`).
