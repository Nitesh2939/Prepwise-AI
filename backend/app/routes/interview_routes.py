from fastapi import APIRouter, Depends
from app.models.schemas import EvaluationRequest
from app.services.ai_engine import evaluate_answer

router = APIRouter()

from app.utils.dependencies import get_current_user

@router.post("/evaluate")
def evaluate(data: EvaluationRequest, user=Depends(get_current_user)):
    result = evaluate_answer(
        question=data.question,
        answer=data.answer,
        role=data.role
    )
    return result