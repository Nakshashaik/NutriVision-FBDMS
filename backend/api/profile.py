from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import UserProfile
from schemas import UserProfileCreate
from security import get_current_user_id

from nutrition.calculator import calculate_nutrition_targets


router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_profile(
    profile: UserProfileCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    existing_profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    nutrition = calculate_nutrition_targets(
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        activity_level=profile.activity_level.value,
        goal=profile.goal.value
    )

    new_profile = UserProfile(
        user_id=user_id,
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        activity_level=profile.activity_level.value,
        goal=profile.goal.value,
        diet_type=profile.diet_type.value,

        daily_calorie_target=nutrition["daily_calorie_target"],
        protein_target_g=nutrition["protein_g"],
        carbs_target_g=nutrition["carbs_g"],
        fat_target_g=nutrition["fat_g"],
        fiber_target_g=nutrition["fiber_g"]
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Profile created successfully",

        "profile_id": str(new_profile.profile_id),
        "user_id": str(new_profile.user_id),

        "nutrition_targets": {
            "bmr": nutrition["bmr"],
            "tdee": nutrition["tdee"],
            "daily_calories": nutrition["daily_calorie_target"],
            "protein_g": nutrition["protein_g"],
            "carbs_g": nutrition["carbs_g"],
            "fat_g": nutrition["fat_g"],
            "fiber_g": nutrition["fiber_g"]
        }
    }
@router.put("")
def update_profile(
    profile: UserProfileCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    existing_profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if not existing_profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    nutrition = calculate_nutrition_targets(
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        activity_level=profile.activity_level.value,
        goal=profile.goal.value
    )

    existing_profile.age = profile.age
    existing_profile.height_cm = profile.height_cm
    existing_profile.weight_kg = profile.weight_kg
    existing_profile.activity_level = profile.activity_level.value
    existing_profile.goal = profile.goal.value
    existing_profile.diet_type = profile.diet_type.value

    existing_profile.daily_calorie_target = (
        nutrition["daily_calorie_target"]
    )

    existing_profile.protein_target_g = (
        nutrition["protein_g"]
    )

    existing_profile.carbs_target_g = (
        nutrition["carbs_g"]
    )

    existing_profile.fat_target_g = (
        nutrition["fat_g"]
    )

    existing_profile.fiber_target_g = (
        nutrition["fiber_g"]
    )

    db.commit()
    db.refresh(existing_profile)

    return {
        "message": "Profile updated successfully",
        "profile_id": str(existing_profile.profile_id),
        "user_id": str(existing_profile.user_id),
        "nutrition_targets": {
            "bmr": nutrition["bmr"],
            "tdee": nutrition["tdee"],
            "daily_calories": nutrition["daily_calorie_target"],
            "protein_g": nutrition["protein_g"],
            "carbs_g": nutrition["carbs_g"],
            "fat_g": nutrition["fat_g"],
            "fiber_g": nutrition["fiber_g"]
        }
    }