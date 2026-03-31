from fastapi import APIRouter
from app.database.mongodb import db

router = APIRouter()

@router.get("/interviews")
def get_interviews():
    data = list(db.interviews.find({}, {"_id": 0}))
    return data