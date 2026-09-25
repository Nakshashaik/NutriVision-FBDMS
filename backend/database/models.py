from sqlalchemy import (
    Column,
    String,
    DateTime,
    Date,
    Integer,
    Numeric,
    ForeignKey,
    Boolean
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.database import Base


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    user_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =========================================================
# USER PROFILE
# =========================================================

class UserProfile(Base):
    __tablename__ = "user_profiles"

    profile_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE"
        ),
        unique=True,
        nullable=False
    )

    age = Column(Integer)

    height_cm = Column(
        Numeric(5, 2)
    )

    weight_kg = Column(
        Numeric(5, 2)
    )

    activity_level = Column(
        String(30)
    )

    goal = Column(
        String(30)
    )

    diet_type = Column(
        String(30)
    )

    daily_calorie_target = Column(
        Numeric(8, 2)
    )

    protein_target_g = Column(
        Numeric(8, 2)
    )

    carbs_target_g = Column(
        Numeric(8, 2)
    )

    fat_target_g = Column(
        Numeric(8, 2)
    )

    fiber_target_g = Column(
        Numeric(8, 2)
    )


# =========================================================
# FOOD
# =========================================================

class Food(Base):
    __tablename__ = "foods"

    food_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    name = Column(
        String(150),
        nullable=False,
        unique=True
    )

    category = Column(
        String(50),
        nullable=False
    )

    serving_size_g = Column(
        Numeric(8, 2),
        nullable=False
    )

    calories = Column(
        Numeric(8, 2),
        nullable=False
    )

    protein_g = Column(
        Numeric(8, 2),
        nullable=False
    )

    carbs_g = Column(
        Numeric(8, 2),
        nullable=False
    )

    fat_g = Column(
        Numeric(8, 2),
        nullable=False
    )

    fiber_g = Column(
        Numeric(8, 2),
        nullable=False
    )

    source = Column(
        String(100),
        nullable=True
    )

    source_reference = Column(
        String(255),
        nullable=True
    )

    source_food_id = Column(
        String(100),
        nullable=True
    )

# =========================================================
# MEAL
# =========================================================

class Meal(Base):
    __tablename__ = "meals"

    meal_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    meal_type = Column(
        String(30),
        nullable=False
    )

    image_url = Column(
        String,
        nullable=True
    )

    meal_date = Column(
        Date,
        server_default=func.current_date()
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    consumed_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =========================================================
# MEAL ITEM
# =========================================================

class MealItem(Base):
    __tablename__ = "meal_items"

    meal_item_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    meal_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "meals.meal_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    food_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "foods.food_id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    # Existing database column
    quantity = Column(
        Numeric(8, 2),
        nullable=False
    )

    # Existing database column
    unit = Column(
        String(30),
        nullable=False
    )

    # Nutrition snapshot
    calories = Column(
        Numeric(8, 2),
        server_default="0"
    )

    protein_g = Column(
        Numeric(8, 2),
        server_default="0"
    )

    carbs_g = Column(
        Numeric(8, 2),
        server_default="0"
    )

    fat_g = Column(
        Numeric(8, 2),
        server_default="0"
    )

    fiber_g = Column(
        Numeric(8, 2),
        server_default="0"
    )

    # AI-related fields
    confidence_score = Column(
        Numeric(8, 2),
        nullable=True
    )

    user_confirmed = Column(
        Boolean,
        server_default="false"
    )

    # Quantity in grams
    quantity_g = Column(
        Numeric(8, 2),
        nullable=False,
        server_default="0"
    )