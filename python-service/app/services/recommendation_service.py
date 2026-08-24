"""
Lightweight heuristic ranking for candidate booking slots.

Node remains the source of truth for which slots are actually available —
this service only re-ranks a list Node has already filtered, so there's no
duplicated availability logic between the two services.
"""

from datetime import date, datetime

from app.schemas.availability import CandidateSlot, RankedSlot, TimeOfDay

_PERIOD_BASE_SCORE = {"Morning": 0.7, "Afternoon": 0.6, "Evening": 0.5}


def _parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def rank_slots(
    slots: list[CandidateSlot],
    preferred_time_of_day: TimeOfDay | None,
    is_emergency: bool,
) -> list[RankedSlot]:
    today = date.today()
    ranked: list[RankedSlot] = []

    for slot in slots:
        slot_date = _parse_date(slot.date)
        days_out = (slot_date - today).days

        score = _PERIOD_BASE_SCORE.get(slot.period, 0.5)
        reasons: list[str] = []

        if is_emergency:
            # For emergencies, soonest wins outright.
            score += max(0.0, 1.0 - days_out * 0.15)
            reasons.append("prioritised for urgency (soonest available)")
        else:
            # Otherwise mildly prefer a couple of days out (not same-day rush,
            # not too far away) and the customer's stated time preference.
            proximity_score = 0.3 if 1 <= days_out <= 5 else 0.15
            score += proximity_score
            if 1 <= days_out <= 5:
                reasons.append("within the next few days")

            if preferred_time_of_day and slot.period.lower() == preferred_time_of_day:
                score += 0.25
                reasons.append(f"matches your preferred {preferred_time_of_day}")

        ranked.append(
            RankedSlot(
                date=slot.date,
                slot_id=slot.slot_id,
                label=slot.label,
                score=round(min(score, 1.0), 2),
                reason="; ".join(reasons) or "generally available",
            )
        )

    ranked.sort(key=lambda s: s.score, reverse=True)
    return ranked
