import json
import re
from pydantic import BaseModel, ValidationError


class CoachingResponse(BaseModel):
    needs_improvement: bool
    observation: str | None = None
    why_it_matters: str | None = None
    suggested_prompt: str | None = None


def parse_model_response(raw: str) -> CoachingResponse:
    # Layer 1: Clean JSON parse (strip markdown fences if present)
    try:
        cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
        data = json.loads(cleaned)
        return CoachingResponse(**data)
    except (json.JSONDecodeError, ValidationError):
        pass

    # Layer 2: JSON buried in surrounding text
    try:
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            return CoachingResponse(**data)
    except (json.JSONDecodeError, ValidationError):
        pass

    # Layer 3: Extract from structured text sections
    try:
        return _extract_from_text(raw)
    except Exception:
        pass

    # Layer 4: Safe default — fail silently
    return CoachingResponse(needs_improvement=False)


def _extract_from_text(raw: str) -> CoachingResponse:
    observation = None
    why_it_matters = None
    suggested_prompt = None
    current_section = None

    for line in raw.split("\n"):
        lower = line.lower().strip()
        if "observation" in lower:
            current_section = "observation"
        elif "why it matters" in lower or "why_it_matters" in lower:
            current_section = "why"
        elif "suggested prompt" in lower or "suggested_prompt" in lower:
            current_section = "suggestion"
        elif line.strip() and current_section:
            if current_section == "observation" and not observation:
                observation = line.strip()
            elif current_section == "why" and not why_it_matters:
                why_it_matters = line.strip()
            elif current_section == "suggestion" and not suggested_prompt:
                suggested_prompt = line.strip()

    if not observation and not suggested_prompt:
        return CoachingResponse(needs_improvement=False)

    return CoachingResponse(
        needs_improvement=True,
        observation=observation,
        why_it_matters=why_it_matters,
        suggested_prompt=suggested_prompt,
    )
