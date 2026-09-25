from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import (
    UserProfile,
    Food,
    Meal,
    MealItem
)

from security import get_current_user_id

from nutrition.recommender import (
    calculate_nutritional_gaps,
    recommend_foods
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# GET RECOMMENDATIONS
# ============================================================

@router.get("")
def get_recommendations(

    limit: int = 10,

    user_id: str = Depends(
        get_current_user_id
    ),

    db: Session = Depends(
        get_db
    )
):

    # --------------------------------------------------------
    # Validate limit
    # --------------------------------------------------------

    if limit < 1:
        limit = 1

    if limit > 50:
        limit = 50


    # --------------------------------------------------------
    # Get user profile
    # --------------------------------------------------------

    profile = (
        db.query(UserProfile)
        .filter(
            UserProfile.user_id == user_id
        )
        .first()
    )


    if not profile:

        return {
            "message": "Profile not found"
        }


    # --------------------------------------------------------
    # Get today's nutrition
    # --------------------------------------------------------

    from api.nutrition import get_today_nutrition

    today_data = get_today_nutrition(
        user_id=user_id,
        db=db
    )


    # --------------------------------------------------------
    # Get nutrition values
    # --------------------------------------------------------

    targets = today_data["targets"]

    consumed = today_data["consumed"]


    # --------------------------------------------------------
    # Calculate remaining nutritional requirements
    # --------------------------------------------------------

    nutritional_gaps = calculate_nutritional_gaps(
        targets=targets,
        consumed=consumed
    )


    # --------------------------------------------------------
    # Find today's meals
    # --------------------------------------------------------

    today = datetime.now(
        timezone.utc
    ).date()


    meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == user_id,
            Meal.meal_date == today
        )
        .all()
    )


    # --------------------------------------------------------
    # Find foods already consumed today
    # --------------------------------------------------------

    consumed_food_ids = set()


    for meal in meals:

        meal_items = (
            db.query(MealItem)
            .filter(
                MealItem.meal_id == meal.meal_id
            )
            .all()
        )


        for item in meal_items:

            consumed_food_ids.add(
                str(item.food_id)
            )


    # --------------------------------------------------------
    # Get food database
    # --------------------------------------------------------

    foods = (
        db.query(Food)
        .all()
    )


    # --------------------------------------------------------
    # Generate recommendations
    # --------------------------------------------------------

    recommendations = recommend_foods(

        foods=foods,

        nutritional_gaps=nutritional_gaps,

        diet_type=profile.diet_type,

        consumed_food_ids=consumed_food_ids,

        limit=limit
    )


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "user": {

            "user_id": str(
                user_id
            ),

            "diet_type": profile.diet_type,

            "goal": profile.goal,

            "activity_level": (
                profile.activity_level
            )
        },


        "nutrition": {

            "targets": targets,

            "consumed": consumed,

            "remaining": nutritional_gaps
        },


        "recommendations": recommendations
    }