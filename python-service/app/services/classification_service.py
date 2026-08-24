"""
Lightweight keyword-based classifier for free-text service descriptions.

This is intentionally simple (no external model or API key required) so the
service runs standalone. It is a placeholder for a real NLP/LLM classifier —
swap `classify` for a model call without changing the router contract.
"""

from app.schemas.classification import ClassificationCandidate, RequirementType

_KEYWORDS: dict[RequirementType, list[str]] = {
    "emergency": [
        "emergency", "urgent", "asap", "right now", "burning", "smoke",
        "sparking", "flooding", "leak everywhere", "won't turn off",
        "completely broken", "totally dead", "no cooling at all",
    ],
    "installation": [
        "install", "new unit", "fit a new", "first time", "never had",
        "new system", "brand new", "set up", "installation",
    ],
    "repair": [
        "broken", "not working", "stopped working", "fault", "faulty",
        "error code", "leaking", "leak", "noise", "noisy", "rattling",
        "won't turn on", "not cooling", "not heating", "repair", "fix",
    ],
    "servicing": [
        "service", "clean", "filter", "annual check", "routine",
        "servicing", "tune up", "check up", "inspection",
    ],
    "maintenance": [
        "maintenance", "preventative", "regular check", "ongoing care",
        "contract", "schedule", "recurring",
    ],
    "replacement": [
        "replace", "replacement", "upgrade", "old unit", "outdated",
        "obsolete", "r22", "swap out", "too old",
    ],
    "diagnostics": [
        "diagnose", "diagnostic", "not sure what's wrong", "investigate",
        "assess", "second opinion", "intermittent", "unexplained",
    ],
}


def classify(description: str) -> tuple[RequirementType, float, list[str], list[ClassificationCandidate]]:
    text = description.lower()

    scores: dict[RequirementType, tuple[float, list[str]]] = {}
    for requirement, keywords in _KEYWORDS.items():
        matched = [kw for kw in keywords if kw in text]
        if matched:
            # Weight by number of distinct matches, capped so one field can't dominate.
            score = min(0.5 + 0.15 * len(matched), 0.95)
            scores[requirement] = (score, matched)

    if not scores:
        return "other", 0.3, [], []

    ranked = sorted(scores.items(), key=lambda item: item[1][0], reverse=True)
    top_requirement, (top_score, top_matches) = ranked[0]

    alternatives = [
        ClassificationCandidate(requirement=req, confidence=round(score, 2))
        for req, (score, _matches) in ranked[1:4]
    ]

    return top_requirement, round(top_score, 2), top_matches, alternatives
