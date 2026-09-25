from enum import Enum

from pydantic import BaseModel, EmailStr, Field


# =========================================================
# AUTHENTICATION
# =========================================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# USER PROFILE
# =========================================================

class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class Goal(str, Enum):
    lose = "lose"
    maintain = "maintain"
    gain = "gain"


class DietType(str, Enum):
    vegetarian = "vegetarian"
    non_vegetarian = "non_vegetarian"
    vegan = "vegan"
    eggetarian = "eggetarian"


class UserProfileCreate(BaseModel):
    age: int = Field(..., ge=13, le=120)

    height_cm: float = Field(
        ...,
        gt=50,
        le=250
    )

    weight_kg: float = Field(
        ...,
        gt=20,
        le=300
    )

    activity_level: ActivityLevel
    goal: Goal
    diet_type: DietType


# =========================================================
# FOOD
# =========================================================

class FoodCreate(BaseModel):
    name: str
    category: str

    serving_size_g: float = Field(
        ...,
        gt=0
    )

    calories: float = Field(
        ...,
        ge=0
    )

    protein_g: float = Field(
        ...,
        ge=0
    )

    carbs_g: float = Field(
        ...,
        ge=0
    )

    fat_g: float = Field(
        ...,
        ge=0
    )

    fiber_g: float = Field(
        ...,
        ge=0
    )


# =========================================================
# MEALS
# =========================================================

class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"


class MealCreate(BaseModel):
    meal_type: MealType


# =========================================================
# MEAL ITEMS
# =========================================================

class MealItemCreate(BaseModel):
    food_id: str

    quantity_g: float = Field(
        ...,
        gt=0
    )
class MealItemUpdate(BaseModel):
    quantity_g: float = Field(..., gt=0)