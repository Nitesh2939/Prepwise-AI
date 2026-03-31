from fastapi import FastAPI
from app.routes import interview_routes
from app.routes import auth_routes

app = FastAPI()

app.include_router(interview_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
def home():
    return {"message": "PrepWise AI Backend Running"}