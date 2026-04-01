from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()  
import PyPDF2
import io
from app.services.ai_engine import generate_questions_from_resume

router = APIRouter()


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF resume and generate interview questions.
    
    Args:
        file: PDF file to upload and analyze
        
    Returns:
        {
            "message": "Resume processed successfully",
            "questions": ["question1", "question2", ...]
        }
        
    Raises:
        HTTPException: If file is invalid, empty, or processing fails
    """
    try:
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="File must be a PDF"
            )

        # Read file content
        file_content = await file.read()
        
        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="File is empty"
            )

        # Validate file size (max 10MB)
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="File size exceeds 10MB limit"
            )

        # Extract text from PDF
        text = ""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            
            if len(pdf_reader.pages) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="PDF has no pages"
                )
            
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            
            if not text or len(text.strip()) < 10:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF. Please ensure it's a valid, text-based PDF."
                )
                
        except PyPDF2.PdfReadError:
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file. Please ensure the file is not corrupted."
            )

        # Generate questions using AI
        try:
            questions = generate_questions_from_resume(text)
            
            # Validate questions
            if not isinstance(questions, list) or len(questions) == 0:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate interview questions"
                )
            
            return {
                "message": "Resume processed successfully",
                "questions": questions
            }
            
        except ValueError as e:
            raise HTTPException(
                status_code=500,
                detail=f"AI processing error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate questions from resume. Please try again."
            )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing the resume"
        )
