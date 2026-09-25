from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import UserProfile, Meal, MealItem
from security import get_current_user_id


router = APIRouter(
    prefix="/api/nutrition",
    tags=["Nutrition"]
)


# =========================================================
# DATABASE SESSION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# TODAY'S NUTRITION
# =========================================================

@router.get("/today")
def get_today_nutrition(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if not profile:
        return {
            "message": "Profile not found"
        }

    today = datetime.now(timezone.utc).date()

    meals = db.query(Meal).filter(
        Meal.user_id == user_id,
        Meal.meal_date == today
    ).all()

    total_calories = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0
    total_fiber = 0.0

    meal_summary = []

    for meal in meals:

        items = db.query(MealItem).filter(
            MealItem.meal_id == meal.meal_id
        ).all()

        meal_calories = 0.0
        meal_protein = 0.0
        meal_carbs = 0.0
        meal_fat = 0.0
        meal_fiber = 0.0

        for item in items:

            meal_calories += float(
                item.calories or 0
            )

            meal_protein += float(
                item.protein_g or 0
            )

            meal_carbs += float(
                item.carbs_g or 0
            )

            meal_fat += float(
                item.fat_g or 0
            )

            meal_fiber += float(
                item.fiber_g or 0
            )

        total_calories += meal_calories
        total_protein += meal_protein
        total_carbs += meal_carbs
        total_fat += meal_fat
        total_fiber += meal_fiber

        meal_summary.append({

            "meal_id": str(
                meal.meal_id
            ),

            "meal_type": meal.meal_type,

            "nutrition": {

                "calories": round(
                    meal_calories,
                    2
                ),

                "protein_g": round(
                    meal_protein,
                    2
                ),

                "carbs_g": round(
                    meal_carbs,
                    2
                ),

                "fat_g": round(
                    meal_fat,
                    2
                ),

                "fiber_g": round(
                    meal_fiber,
                    2
                )
            }
        })

    # =====================================================
    # TARGETS
    # =====================================================

    calorie_target = float(
        profile.daily_calorie_target or 0
    )

    protein_target = float(
        profile.protein_target_g or 0
    )

    carbs_target = float(
        profile.carbs_target_g or 0
    )

    fat_target = float(
        profile.fat_target_g or 0
    )

    fiber_target = float(
        profile.fiber_target_g or 0
    )

    # =====================================================
    # REMAINING
    # =====================================================

    remaining_calories = max(
        calorie_target - total_calories,
        0
    )

    remaining_protein = max(
        protein_target - total_protein,
        0
    )

    remaining_carbs = max(
        carbs_target - total_carbs,
        0
    )

    remaining_fat = max(
        fat_target - total_fat,
        0
    )

    remaining_fiber = max(
        fiber_target - total_fiber,
        0
    )

    # =====================================================
    # PROGRESS
    # =====================================================

    def percentage(
        consumed,
        target
    ):

        if target <= 0:
            return 0

        return round(
            (consumed / target) * 100,
            2
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "date": str(today),

        "targets": {

            "calories": round(
                calorie_target,
                2
            ),

            "protein_g": round(
                protein_target,
                2
            ),

            "carbs_g": round(
                carbs_target,
                2
            ),

            "fat_g": round(
                fat_target,
                2
            ),

            "fiber_g": round(
                fiber_target,
                2
            )
        },

        "consumed": {

            "calories": round(
                total_calories,
                2
            ),

            "protein_g": round(
                total_protein,
                2
            ),

            "carbs_g": round(
                total_carbs,
                2
            ),

            "fat_g": round(
                total_fat,
                2
            ),

            "fiber_g": round(
                total_fiber,
                2
            )
        },

        "remaining": {

            "calories": round(
                remaining_calories,
                2
            ),

            "protein_g": round(
                remaining_protein,
                2
            ),

            "carbs_g": round(
                remaining_carbs,
                2
            ),

            "fat_g": round(
                remaining_fat,
                2
            ),

            "fiber_g": round(
                remaining_fiber,
                2
            )
        },

        "progress": {

            "calories": percentage(
                total_calories,
                calorie_target
            ),

            "protein": percentage(
                total_protein,
                protein_target
            ),

            "carbs": percentage(
                total_carbs,
                carbs_target
            ),

            "fat": percentage(
                total_fat,
                fat_target
            ),

            "fiber": percentage(
                total_fiber,
                fiber_target
            )
        },

        "meals": meal_summary
    }


# =========================================================
# NUTRITION HISTORY
# =========================================================

@router.get("/history")
def get_nutrition_history(
    days: int = 7,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # =====================================================
    # VALIDATE DAYS
    # =====================================================

    if days < 1 or days > 30:

        raise HTTPException(
            status_code=400,
            detail="Days must be between 1 and 30"
        )

    # =====================================================
    # GET PROFILE
    # =====================================================

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if not profile:

        return {
            "message": "Profile not found"
        }

    # =====================================================
    # DATE
    # =====================================================

    today = datetime.now(
        timezone.utc
    ).date()

    # =====================================================
    # HISTORY
    # =====================================================

    history = []

    for i in range(days):

        current_date = (
            today - timedelta(days=i)
        )

        meals = db.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.meal_date == current_date
        ).all()

        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fat = 0.0
        total_fiber = 0.0

        # Count only meals that contain items
        tracked_meal_count = 0

        for meal in meals:

            items = db.query(MealItem).filter(
                MealItem.meal_id == meal.meal_id
            ).all()

            if items:

                tracked_meal_count += 1

            for item in items:

                total_calories += float(
                    item.calories or 0
                )

                total_protein += float(
                    item.protein_g or 0
                )

                total_carbs += float(
                    item.carbs_g or 0
                )

                total_fat += float(
                    item.fat_g or 0
                )

                total_fiber += float(
                    item.fiber_g or 0
                )

        # =================================================
        # CALORIE TARGET
        # =================================================

        calorie_target = float(
            profile.daily_calorie_target or 0
        )

        # =================================================
        # PROGRESS
        # =================================================

        progress = 0

        if calorie_target > 0:

            progress = round(
                (
                    total_calories
                    / calorie_target
                ) * 100,
                2
            )

        # =================================================
        # REMAINING
        # =================================================

        remaining_calories = max(
            calorie_target - total_calories,
            0
        )

        # =================================================
        # ADD DAY
        # =================================================

        history.append({

            "date": str(
                current_date
            ),

            "calories": {

                "target": round(
                    calorie_target,
                    2
                ),

                "consumed": round(
                    total_calories,
                    2
                ),

                "remaining": round(
                    remaining_calories,
                    2
                ),

                "progress": progress
            },

            "protein_g": round(
                total_protein,
                2
            ),

            "carbs_g": round(
                total_carbs,
                2
            ),

            "fat_g": round(
                total_fat,
                2
            ),

            "fiber_g": round(
                total_fiber,
                2
            ),

            "meal_count": tracked_meal_count
        })

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "days": days,

        "history": history
    }


# =========================================================
# WEEKLY NUTRITION SUMMARY
# =========================================================

@router.get("/weekly")
def get_weekly_nutrition(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # =====================================================
    # GET PROFILE
    # =====================================================

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if not profile:

        return {
            "message": "Profile not found"
        }

    # =====================================================
    # DATE RANGE
    # =====================================================

    today = datetime.now(
        timezone.utc
    ).date()

    start_date = (
        today - timedelta(days=6)
    )

    # =====================================================
    # GET MEALS
    # =====================================================

    meals = db.query(Meal).filter(

        Meal.user_id == user_id,

        Meal.meal_date >= start_date,

        Meal.meal_date <= today

    ).all()

    # =====================================================
    # TOTALS
    # =====================================================

    total_calories = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0
    total_fiber = 0.0

    # =====================================================
    # DAILY CALORIE STORAGE
    # =====================================================

    daily_calories = {}

    for i in range(7):

        current_date = (
            start_date + timedelta(days=i)
        )

        daily_calories[
            current_date
        ] = 0.0

    # =====================================================
    # PROCESS MEALS
    # =====================================================

    for meal in meals:

        items = db.query(MealItem).filter(
            MealItem.meal_id == meal.meal_id
        ).all()

        for item in items:

            calories = float(
                item.calories or 0
            )

            protein = float(
                item.protein_g or 0
            )

            carbs = float(
                item.carbs_g or 0
            )

            fat = float(
                item.fat_g or 0
            )

            fiber = float(
                item.fiber_g or 0
            )

            # =============================================
            # TOTALS
            # =============================================

            total_calories += calories

            total_protein += protein

            total_carbs += carbs

            total_fat += fat

            total_fiber += fiber

            # =============================================
            # DAILY TOTAL
            # =============================================

            if meal.meal_date in daily_calories:

                daily_calories[
                    meal.meal_date
                ] += calories

    # =====================================================
    # CALORIE TARGET
    # =====================================================

    calorie_target = float(
        profile.daily_calorie_target or 0
    )

    # =====================================================
    # TRACKED DAYS
    # =====================================================

    tracked_daily_calories = {

        date: calories

        for date, calories
        in daily_calories.items()

        if calories > 0

    }

    tracked_days = len(
        tracked_daily_calories
    )

    # =====================================================
    # DAILY AVERAGES
    # =====================================================

    average_calories = (
        total_calories / 7
        if total_calories > 0
        else 0
    )

    average_protein = (
        total_protein / 7
        if total_protein > 0
        else 0
    )

    average_carbs = (
        total_carbs / 7
        if total_carbs > 0
        else 0
    )

    average_fat = (
        total_fat / 7
        if total_fat > 0
        else 0
    )

    average_fiber = (
        total_fiber / 7
        if total_fiber > 0
        else 0
    )

    # =====================================================
    # HIGHEST / LOWEST TRACKED DAY
    # =====================================================

    highest_day = None
    lowest_day = None

    if tracked_daily_calories:

        highest_day = max(
            tracked_daily_calories,
            key=tracked_daily_calories.get
        )

        lowest_day = min(
            tracked_daily_calories,
            key=tracked_daily_calories.get
        )

    # =====================================================
    # DAILY BREAKDOWN
    # =====================================================

    daily_breakdown = [

        {
            "date": str(date),

            "calories": round(
                calories,
                2
            )
        }

        for date, calories
        in daily_calories.items()

    ]

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "period": {

            "start_date": str(
                start_date
            ),

            "end_date": str(
                today
            ),

            "days": 7
        },

        "calorie_target": round(
            calorie_target,
            2
        ),

        "totals": {

            "calories": round(
                total_calories,
                2
            ),

            "protein_g": round(
                total_protein,
                2
            ),

            "carbs_g": round(
                total_carbs,
                2
            ),

            "fat_g": round(
                total_fat,
                2
            ),

            "fiber_g": round(
                total_fiber,
                2
            )
        },

        "daily_averages": {

            "calories": round(
                average_calories,
                2
            ),

            "protein_g": round(
                average_protein,
                2
            ),

            "carbs_g": round(
                average_carbs,
                2
            ),

            "fat_g": round(
                average_fat,
                2
            ),

            "fiber_g": round(
                average_fiber,
                2
            )
        },

        "tracking": {

            "tracked_days": tracked_days,

            "total_days": 7
        },

        "highest_calorie_day": (

            {

                "date": str(
                    highest_day
                ),

                "calories": round(
                    tracked_daily_calories[
                        highest_day
                    ],
                    2
                )

            }

            if highest_day

            else None
        ),

        "lowest_calorie_day": (

            {

                "date": str(
                    lowest_day
                ),

                "calories": round(
                    tracked_daily_calories[
                        lowest_day
                    ],
                    2
                )

            }

            if lowest_day

            else None
        ),

        "daily_breakdown": daily_breakdown
    }