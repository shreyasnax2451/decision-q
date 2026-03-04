import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="decisions")  # noqa: F821
    options: Mapped[list["Option"]] = relationship("Option", back_populates="decision", cascade="all, delete-orphan", order_by="Option.order")
    criteria: Mapped[list["Criterion"]] = relationship("Criterion", back_populates="decision", cascade="all, delete-orphan")


class Option(Base):
    __tablename__ = "options"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    decision_id: Mapped[str] = mapped_column(String, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(240), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    decision: Mapped["Decision"] = relationship("Decision", back_populates="options")
    scores: Mapped[list["Score"]] = relationship("Score", back_populates="option", cascade="all, delete-orphan")


class Criterion(Base):
    __tablename__ = "criteria"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    decision_id: Mapped[str] = mapped_column(String, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    weight: Mapped[int] = mapped_column(Integer, default=3)  # 1-5

    decision: Mapped["Decision"] = relationship("Decision", back_populates="criteria")
    scores: Mapped[list["Score"]] = relationship("Score", back_populates="criterion", cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    option_id: Mapped[str] = mapped_column(String, ForeignKey("options.id", ondelete="CASCADE"), nullable=False)
    criterion_id: Mapped[str] = mapped_column(String, ForeignKey("criteria.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    normalized_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100


    option: Mapped["Option"] = relationship("Option", back_populates="scores")
    criterion: Mapped["Criterion"] = relationship("Criterion", back_populates="scores")
