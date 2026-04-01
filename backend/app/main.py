from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, interview_routes, dashboard_routes

app = FastAPI(title="PrepWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(interview_routes.router, prefix="/interviews", tags=["Interviews"])
app.include_router(dashboard_routes.router, prefix="/dashboard", tags=["Dashboard"])

@app.get("/")
def home():
    return {"message": "PrepWise AI Backend Running"}

@app.get("/interviews")
def get_interviews():
    return [
        {
            "role": "Frontend Developer",
            "score": 8,
            "date": "2026-04-01T10:00:00"
        },
        {
            "role": "Backend Developer",
            "score": 7,
            "date": "2026-04-02T11:30:00"
        }
    ]

app.include_router(interview_routes.router)
app.include_router(auth_routes.router)
