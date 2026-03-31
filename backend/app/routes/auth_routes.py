from fastapi import APIRouter, HTTPException
from app.models.user_schema import UserSignup, UserLogin
from app.database.mongodb import users_collection
from passlib.hash import bcrypt

router = APIRouter()

@router.post("/signup")
def signup(user: UserSignup):

    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = bcrypt.hash(user.password)

    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    })

    return {"message": "User created successfully"}


from app.utils.jwt_handler import create_access_token

@router.post("/login")
def login(user: LoginRequest):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not bcrypt.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer"
    }