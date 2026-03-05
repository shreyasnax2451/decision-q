from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.decisions import router as decisions_router

import app.models  # noqa: F401

app = FastAPI(
    title="Decision-Q API",
    description="Backend for the Decision Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend
# Splitting by comma allowed for multiple frontend URLs (e.g., preview URLs)
_origins = [o.strip().rstrip("/") for o in settings.FRONTEND_URL.split(",") if o.strip()]
_origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])
unique_origins = list(set(_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=unique_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables on startup (use Alembic for migrations in production)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# Routers
app.include_router(auth_router, prefix="/api")
app.include_router(decisions_router, prefix="/api")


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "decision-q-api"}
