import { helpCenterFaqs, type HelpFaq } from "@/lib/data/help-center";

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "how", "what", "when", "where",
  "why", "can", "i", "my", "to", "for", "of", "in", "on", "with", "you", "your",
  "it", "and", "or", "will", "be", "have", "has",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

export function matchFaq(input: string): { faq: HelpFaq; score: number } | null {
  const inputWords = tokenize(input);
  if (inputWords.length === 0) return null;

  let best: { faq: HelpFaq; score: number } | null = null;

  for (const faq of helpCenterFaqs) {
    // Weight question/topic words more heavily than answer words so a title
    // match still wins, but answer-only terms (like "reschedule") are still findable.
    const titleWords = tokenize(`${faq.question} ${faq.topic}`);
    const answerWords = tokenize(faq.answer);
    let score = 0;
    for (const word of inputWords) {
      if (titleWords.some((h) => h === word || h.includes(word) || word.includes(h))) {
        score += 2;
      } else if (answerWords.some((h) => h === word || h.includes(word) || word.includes(h))) {
        score += 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { faq, score };
    }
  }

  // Require a reasonably strong match relative to the question length to avoid noisy guesses.
  if (best && best.score / inputWords.length < 0.34) return null;
  return best;
}

export const SUGGESTED_QUESTIONS = [
  "How do I book a service?",
  "Can I reschedule my booking?",
  "What are Care Plans?",
  "How do rewards points work?",
];
