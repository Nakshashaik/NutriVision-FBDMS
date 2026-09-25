from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database.database import engine, Base

from database.models import (
    User,
    UserProfile,
    Food,
    Meal,
    MealItem
)

from api.auth import router as auth_router
from api.profile import router as profile_router
from api.food import router as food_router
from api.meal import router as meal_router
from api.nutrition import router as nutrition_router
from api.recommendations import router as recommendations_router

from security import get_current_user_id


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="NutriVision API",
    description=(
        "Food-Based Dietary Management "
        "System API"
    ),
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    profile_router
)

app.include_router(
    food_router
)

app.include_router(
    meal_router
)

app.include_router(
    nutrition_router
)

app.include_router(
    recommendations_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message":
            "NutriVision API is running!"
    }


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/db-test")
def database_test():

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT 1")
        )

        return {

            "database":
                "connected",

            "result":
                result.scalar()
        }


# =========================================================
# PROTECTED ENDPOINT
# =========================================================

@app.get("/api/protected")
def protected_route(

    user_id: str = Depends(
        get_current_user_id
    )
):

    return {

        "message":
            "You are authenticated!",

        "user_id":
            user_id
    }