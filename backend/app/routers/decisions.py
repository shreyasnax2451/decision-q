from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.decision import Decision, Option, Criterion, Score
from app.schemas.decision import (
    DecisionCreate, DecisionListItem, DecisionDetail, ScoreOut
)
from app.services.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/decisions", tags=["Decisions"])


def _check_limit(user_id: str, db: Session) -> None:
    count = db.query(Decision).filter(Decision.user_id == user_id).count()
    if count >= settings.MAX_DECISIONS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Decision limit reached ({settings.MAX_DECISIONS} decisions max). Please upgrade to Paid Plan.",
        )


@router.get("", response_model=list[DecisionListItem])
def list_decisions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all decisions for the authenticated user."""
    decisions = (
        db.query(Decision)
        .filter(Decision.user_id == current_user.id)
        .order_by(Decision.created_at.desc())
        .all()
    )
    return [
        {
            "id": d.id,
            "title": d.title,
            "created_at": d.created_at,
            "options_count": len(d.options),
        }
        for d in decisions
    ]


@router.post("", response_model=DecisionDetail, status_code=status.HTTP_201_CREATED)
def create_decision(
    body: DecisionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new decision with options, criteria, and scores. Enforces 5-decision limit."""
    _check_limit(current_user.id, db)

    # Validate input
    if not body.options or len(body.options) < 2:
        raise HTTPException(status_code=422, detail="A decision needs at least 2 options")
    if not body.criteria:
        raise HTTPException(status_code=422, detail="A decision needs at least 1 criterion")

    # Create decision
    decision = Decision(user_id=current_user.id, title=body.title)
    db.add(decision)
    db.flush()  # get decision.id

    # Create options
    option_map: dict[str, Option] = {}
    for opt_in in body.options:
        opt = Option(decision_id=decision.id, label=opt_in.label, order=opt_in.order)
        db.add(opt)
        db.flush()
        option_map[opt_in.label] = opt  # temp map by label (client sends temp IDs)

    # Create criteria
    criterion_map: dict[str, Criterion] = {}
    for crit_in in body.criteria:
        crit = Criterion(decision_id=decision.id, label=crit_in.label, weight=crit_in.weight)
        db.add(crit)
        db.flush()
        criterion_map[crit_in.label] = crit

    # Create scores — re-match by labels (temp IDs)
    max_possible = sum(crit.weight * 5 for crit in criterion_map.values())
    option_raw_totals = {}
    
    # First pass: calculate raw totals
    processed_scores_data = []
    for score_in in body.scores:
        real_option = next((v for v in option_map.values() if v.label == score_in.option_id), None)
        real_criterion = next((v for v in criterion_map.values() if v.label == score_in.criterion_id), None)
        
        if real_option and real_criterion:
            if real_option.id not in option_raw_totals:
                option_raw_totals[real_option.id] = 0
            option_raw_totals[real_option.id] += score_in.score * real_criterion.weight
            
            processed_scores_data.append({
                "option_id": real_option.id,
                "criterion_id": real_criterion.id,
                "score": score_in.score
            })

    # Second pass: Create Score objects with normalized values
    all_scores: list[Score] = []
    for ps in processed_scores_data:
        raw_total = option_raw_totals[ps["option_id"]]
        normalized = 0.0
        if max_possible > 0:
            normalized = round((raw_total / max_possible) * 100, 1)
            
        score_obj = Score(
            option_id=ps["option_id"],
            criterion_id=ps["criterion_id"],
            score=ps["score"],
            normalized_score=normalized
        )
        db.add(score_obj)
        all_scores.append(score_obj)

    db.commit()
    db.refresh(decision)

    # Build response using updated field names
    scores_out = [
        ScoreOut(
            id=s.id,
            option_id=s.option_id,
            criterion_id=s.criterion_id,
            score=s.score,
            normalized_score=s.normalized_score,
        )
        for opt in decision.options
        for s in opt.scores
    ]

    return DecisionDetail(
        id=decision.id,
        title=decision.title,
        created_at=decision.created_at,
        options=decision.options,
        criteria=decision.criteria,
        scores=scores_out,
    )


@router.get("/{decision_id}", response_model=DecisionDetail)
def get_decision(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single decision by ID."""
    decision = db.query(Decision).filter(
        Decision.id == decision_id,
        Decision.user_id == current_user.id,
    ).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    scores_out = [
        ScoreOut(
            id=s.id, 
            option_id=s.option_id, 
            criterion_id=s.criterion_id, 
            score=s.score, 
            normalized_score=s.normalized_score
        )
        for opt in decision.options
        for s in opt.scores
    ]
    return DecisionDetail(
        id=decision.id,
        title=decision.title,
        created_at=decision.created_at,
        options=decision.options,
        criteria=decision.criteria,
        scores=scores_out,
    )


# @router.delete("/{decision_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_decision(
#     decision_id: str,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     """Delete a decision (frees up a slot for a new one)."""
#     decision = db.query(Decision).filter(
#         Decision.id == decision_id,
#         Decision.user_id == current_user.id,
#     ).first()
#     if not decision:
#         raise HTTPException(status_code=404, detail="Decision not found")

#     db.delete(decision)
#     db.commit()
