from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, interview_routes, dashboard_routes
from app.routes.resume_routes import router as resume_router

# ✅ ONLY ONE APP
app = FastAPI(title="PrepWise API")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUDE ALL ROUTES
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(interview_routes.router, prefix="/interviews", tags=["Interviews"])
app.include_router(dashboard_routes.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(resume_router, prefix="/resume", tags=["Resume"])  # ✅ FIXED

# ✅ TEST ROUTES
@app.get("/")
def home():
    return {"message": "PrepWise AI Backend Running"}

@app.get("/interviews")
def get_interviews():
    return [
        {"role": "Frontend Developer", "score": 8, "date": "2026-04-01T10:00:00"},
        {"role": "Backend Developer", "score": 7, "date": "2026-04-02T11:30:00"}
    ]