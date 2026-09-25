from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth
from api import profile
from api import food
from api import meal
from api import nutrition
from api import recommendations


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="NutriVision FBDMS",
    description="Food-Based Dietary Management System",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Production frontend
        "https://nutri-vision-fbdms.vercel.app",
    ],

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS",
    ],

    allow_headers=["*"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "NutriVision FBDMS API is running",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(
    auth.router
)

app.include_router(
    profile.router
)

app.include_router(
    food.router
)

app.include_router(
    meal.router
)

app.include_router(
    nutrition.router
)

app.include_router(
    recommendations.router
)