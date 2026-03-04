from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ─── Option ─────────────────────────────────────────────
class OptionIn(BaseModel):
    label: str
    order: int = 0


class OptionOut(BaseModel):
    id: str
    label: str
    order: int
    # raw_score: int = 0
    # normalized_score: float = 0.0

    model_config = {"from_attributes": True}


# ─── Criterion ──────────────────────────────────────────
class CriterionIn(BaseModel):
    label: str
    weight: int  # 1-5


class CriterionOut(BaseModel):
    id: str
    label: str
    weight: int

    model_config = {"from_attributes": True}


# ─── Score ──────────────────────────────────────────────
class ScoreIn(BaseModel):
    option_id: str
    criterion_id: str
    score: int  # 1-5


class ScoreOut(BaseModel):
    id: str
    option_id: str
    criterion_id: str
    score: int
    normalized_score: float

    model_config = {"from_attributes": True}


# ─── Decision ───────────────────────────────────────────
class DecisionCreate(BaseModel):
    title: str
    options: list[OptionIn]
    criteria: list[CriterionIn]
    scores: list[ScoreIn]


class DecisionListItem(BaseModel):
    id: str
    title: str
    created_at: datetime
    options_count: int

    model_config = {"from_attributes": True}


class DecisionDetail(BaseModel):
    id: str
    title: str
    created_at: datetime
    options: list[OptionOut]
    criteria: list[CriterionOut]
    scores: list[ScoreOut]

    model_config = {"from_attributes": True}
