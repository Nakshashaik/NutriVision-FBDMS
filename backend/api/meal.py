from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import Meal, MealItem, Food
from schemas import MealCreate, MealItemCreate, MealItemUpdate
from security import get_current_user_id


router = APIRouter(
    prefix="/api/meals",
    tags=["Meals"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# CREATE MEAL
# =========================================================

@router.post("")
def create_meal(
    meal: MealCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    new_meal = Meal(
        user_id=user_id,
        meal_type=meal.meal_type.value
    )

    db.add(new_meal)
    db.commit()
    db.refresh(new_meal)

    return {
        "message": "Meal created successfully",
        "meal_id": str(new_meal.meal_id),
        "meal_type": new_meal.meal_type,
        "items": []
    }


# =========================================================
# ADD FOOD TO MEAL
# =========================================================

@router.post("/{meal_id}/items")
def add_meal_item(
    meal_id: str,
    item: MealItemCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK MEAL
    # -----------------------------------------------------

    meal = db.query(Meal).filter(
        Meal.meal_id == meal_id,
        Meal.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    # -----------------------------------------------------
    # CHECK FOOD
    # -----------------------------------------------------

    food = db.query(Food).filter(
        Food.food_id == item.food_id
    ).first()

    if not food:
        raise HTTPException(
            status_code=404,
            detail="Food not found"
        )

    # -----------------------------------------------------
    # CALCULATE NUTRITION
    # -----------------------------------------------------

    multiplier = (
        float(item.quantity_g)
        / float(food.serving_size_g)
    )

    calories = round(
        float(food.calories) * multiplier,
        2
    )

    protein = round(
        float(food.protein_g) * multiplier,
        2
    )

    carbs = round(
        float(food.carbs_g) * multiplier,
        2
    )

    fat = round(
        float(food.fat_g) * multiplier,
        2
    )

    fiber = round(
        float(food.fiber_g) * multiplier,
        2
    )

    # -----------------------------------------------------
    # CREATE MEAL ITEM
    # -----------------------------------------------------

    new_item = MealItem(
        meal_id=meal.meal_id,
        food_id=food.food_id,

        quantity=item.quantity_g,
        quantity_g=item.quantity_g,

        unit="g",

        calories=calories,
        protein_g=protein,
        carbs_g=carbs,
        fat_g=fat,
        fiber_g=fiber,

        confidence_score=None,
        user_confirmed=False
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": "Food added to meal successfully",

        "meal_item_id": str(
            new_item.meal_item_id
        ),

        "food": food.name,

        "quantity_g": float(
            item.quantity_g
        ),

        "calories": calories,
        "protein_g": protein,
        "carbs_g": carbs,
        "fat_g": fat,
        "fiber_g": fiber,

        "nutrition": {
            "calories": calories,
            "protein_g": protein,
            "carbs_g": carbs,
            "fat_g": fat,
            "fiber_g": fiber
        }
    }


# =========================================================
# UPDATE MEAL ITEM QUANTITY
# =========================================================

@router.put("/{meal_id}/items/{meal_item_id}")
def update_meal_item(
    meal_id: str,
    meal_item_id: str,
    item: MealItemUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK MEAL
    # -----------------------------------------------------

    meal = db.query(Meal).filter(
        Meal.meal_id == meal_id,
        Meal.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    # -----------------------------------------------------
    # CHECK MEAL ITEM
    # -----------------------------------------------------

    meal_item = db.query(MealItem).filter(
        MealItem.meal_item_id == meal_item_id,
        MealItem.meal_id == meal_id
    ).first()

    if not meal_item:
        raise HTTPException(
            status_code=404,
            detail="Meal item not found"
        )

    # -----------------------------------------------------
    # GET FOOD
    # -----------------------------------------------------

    food = db.query(Food).filter(
        Food.food_id == meal_item.food_id
    ).first()

    if not food:
        raise HTTPException(
            status_code=404,
            detail="Food not found"
        )

    # -----------------------------------------------------
    # RECALCULATE NUTRITION
    # -----------------------------------------------------

    multiplier = (
        float(item.quantity_g)
        / float(food.serving_size_g)
    )

    calories = round(
        float(food.calories) * multiplier,
        2
    )

    protein = round(
        float(food.protein_g) * multiplier,
        2
    )

    carbs = round(
        float(food.carbs_g) * multiplier,
        2
    )

    fat = round(
        float(food.fat_g) * multiplier,
        2
    )

    fiber = round(
        float(food.fiber_g) * multiplier,
        2
    )

    # -----------------------------------------------------
    # UPDATE DATABASE
    # -----------------------------------------------------

    meal_item.quantity = item.quantity_g
    meal_item.quantity_g = item.quantity_g

    meal_item.calories = calories
    meal_item.protein_g = protein
    meal_item.carbs_g = carbs
    meal_item.fat_g = fat
    meal_item.fiber_g = fiber

    db.commit()
    db.refresh(meal_item)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": "Meal item updated successfully",

        "meal_item_id": str(
            meal_item.meal_item_id
        ),

        "food": food.name,

        "quantity_g": float(
            item.quantity_g
        ),

        "calories": calories,
        "protein_g": protein,
        "carbs_g": carbs,
        "fat_g": fat,
        "fiber_g": fiber,

        "nutrition": {
            "calories": calories,
            "protein_g": protein,
            "carbs_g": carbs,
            "fat_g": fat,
            "fiber_g": fiber
        }
    }


# =========================================================
# DELETE MEAL ITEM
# =========================================================

@router.delete("/{meal_id}/items/{meal_item_id}")
def delete_meal_item(
    meal_id: str,
    meal_item_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    meal = db.query(Meal).filter(
        Meal.meal_id == meal_id,
        Meal.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    meal_item = db.query(MealItem).filter(
        MealItem.meal_item_id == meal_item_id,
        MealItem.meal_id == meal_id
    ).first()

    if not meal_item:
        raise HTTPException(
            status_code=404,
            detail="Meal item not found"
        )

    db.delete(meal_item)
    db.commit()

    return {
        "message": "Meal item deleted successfully",
        "meal_item_id": meal_item_id
    }


# =========================================================
# DELETE ENTIRE MEAL
# =========================================================

@router.delete("/{meal_id}")
def delete_meal(
    meal_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    meal = db.query(Meal).filter(
        Meal.meal_id == meal_id,
        Meal.user_id == user_id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    db.delete(meal)
    db.commit()

    return {
        "message": "Meal deleted successfully",
        "meal_id": meal_id
    }


# =========================================================
# GET ALL USER MEALS
# =========================================================

@router.get("")
def get_meals(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    meals = db.query(Meal).filter(
        Meal.user_id == user_id
    ).order_by(
        Meal.created_at.desc()
    ).all()

    result = []

    for meal in meals:

        # -------------------------------------------------
        # GET ITEMS
        # -------------------------------------------------

        items = db.query(MealItem).filter(
            MealItem.meal_id == meal.meal_id
        ).all()

        meal_items = []

        for item in items:

            food = db.query(Food).filter(
                Food.food_id == item.food_id
            ).first()

            if not food:
                continue

            # ---------------------------------------------
            # NUTRITION VALUES
            # ---------------------------------------------

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

            quantity_g = float(
                item.quantity_g or
                item.quantity or
                0
            )

            # ---------------------------------------------
            # MEAL ITEM
            # ---------------------------------------------

            meal_items.append({

                "meal_item_id": str(
                    item.meal_item_id
                ),

                "food_id": str(
                    food.food_id
                ),

                "food_name": food.name,

                "quantity_g": quantity_g,

                # IMPORTANT:
                # Frontend reads these directly

                "calories": calories,

                "protein_g": protein,

                "carbs_g": carbs,

                "fat_g": fat,

                "fiber_g": fiber,

                # Also keep structured nutrition

                "nutrition": {

                    "calories": calories,

                    "protein_g": protein,

                    "carbs_g": carbs,

                    "fat_g": fat,

                    "fiber_g": fiber
                }
            })

        # -------------------------------------------------
        # MEAL
        # -------------------------------------------------

        result.append({

            "meal_id": str(
                meal.meal_id
            ),

            "meal_type": meal.meal_type,

            "meal_date": meal.meal_date,

            "created_at": meal.created_at,

            "consumed_at": meal.consumed_at,

            "image_url": meal.image_url,

            "items": meal_items
        })

    return result