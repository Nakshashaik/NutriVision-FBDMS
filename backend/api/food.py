from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import Food
from schemas import FoodCreate


router = APIRouter(
    prefix="/api/foods",
    tags=["Food"]
)


# ============================================================
# DATABASE SESSION
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# CREATE FOOD
# ============================================================

@router.post("")
def create_food(
    food: FoodCreate,
    db: Session = Depends(get_db)
):
    existing_food = db.query(Food).filter(
        Food.name == food.name
    ).first()

    if existing_food:
        raise HTTPException(
            status_code=400,
            detail="Food already exists"
        )

    new_food = Food(
        name=food.name,
        category=food.category,
        serving_size_g=food.serving_size_g,
        calories=food.calories,
        protein_g=food.protein_g,
        carbs_g=food.carbs_g,
        fat_g=food.fat_g,
        fiber_g=food.fiber_g
    )

    db.add(new_food)
    db.commit()
    db.refresh(new_food)

    return {
        "message": "Food created successfully",
        "food_id": str(new_food.food_id),
        "name": new_food.name
    }


# ============================================================
# GET ALL FOODS
# ============================================================

@router.get("")
def get_foods(
    db: Session = Depends(get_db)
):
    foods = db.query(Food).all()

    # Temporary debugging
    print("========================================")
    print("🔥 GET /api/foods")
    print("🔥 FOOD COUNT FROM ENDPOINT:", len(foods))
    print("========================================")

    return [
        {
            "food_id": str(food.food_id),
            "name": food.name,
            "category": food.category,
            "serving_size_g": float(food.serving_size_g),
            "calories": float(food.calories),
            "protein_g": float(food.protein_g),
            "carbs_g": float(food.carbs_g),
            "fat_g": float(food.fat_g),
            "fiber_g": float(food.fiber_g)
        }
        for food in foods
    ]


# ============================================================
# SEARCH FOODS
# ============================================================

@router.get("/search")
def search_foods(
    query: str,
    db: Session = Depends(get_db)
):
    foods = db.query(Food).filter(
        Food.name.ilike(f"%{query}%")
    ).all()

    print("========================================")
    print("🔎 FOOD SEARCH")
    print("🔎 QUERY:", query)
    print("🔎 RESULTS:", len(foods))
    print("========================================")

    return [
        {
            "food_id": str(food.food_id),
            "name": food.name,
            "category": food.category,
            "serving_size_g": float(food.serving_size_g),
            "calories": float(food.calories),
            "protein_g": float(food.protein_g),
            "carbs_g": float(food.carbs_g),
            "fat_g": float(food.fat_g),
            "fiber_g": float(food.fiber_g)
        }
        for food in foods
    ]