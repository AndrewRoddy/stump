# Quiz Card Generation Instructions

## Answer Length Randomization

When generating a quiz card, use the following process to determine where the correct answer ranks by character length among the four options:

1. Generate a random integer from 1 to 4 (inclusive).
2. Rank all four answer options by character length (shortest = rank 1, longest = rank 4).
3. Make the correct answer the option whose length matches the rolled rank:
   - **1** → correct answer is the **shortest** of the four options
   - **2** → correct answer is the **second shortest**
   - **3** → correct answer is the **third shortest** (second longest)
   - **4** → correct answer is the **longest** of the four options

The three incorrect options should be plausible distractors whose lengths fill the remaining ranks.

If two or more options happen to be the same length, treat ties as the same rank — adjust wording slightly to break the tie and maintain the target rank.

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
