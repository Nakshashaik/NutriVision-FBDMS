ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.20,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.90
}


GOAL_ADJUSTMENTS = {
    "lose": -500,
    "maintain": 0,
    "gain": 300
}


def calculate_bmr(age: int, height_cm: float, weight_kg: float) -> float:
    """
    Estimate BMR using a gender-neutral formula.

    This is an approximate energy estimate because the current
    user profile does not collect sex/gender.
    """

    bmr = (
        10 * weight_kg
        + 6.25 * height_cm
        - 5 * age
        + 5
    )

    return round(bmr, 2)


def calculate_tdee(
    bmr: float,
    activity_level: str
) -> float:

    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level)

    if multiplier is None:
        raise ValueError("Invalid activity level")

    return round(bmr * multiplier, 2)


def calculate_daily_calories(
    tdee: float,
    goal: str
) -> float:

    adjustment = GOAL_ADJUSTMENTS.get(goal)

    if adjustment is None:
        raise ValueError("Invalid goal")

    calories = tdee + adjustment

    # Prevent extremely low calculated targets.
    calories = max(calories, 1200)

    return round(calories, 2)


def calculate_macros(
    calories: float,
    weight_kg: float
) -> dict:

    # Protein: approximately 1.6 g/kg
    protein_g = weight_kg * 1.6

    # 25% of calories from fat
    fat_calories = calories * 0.25
    fat_g = fat_calories / 9

    # Remaining calories from carbohydrates
    protein_calories = protein_g * 4
    carbs_calories = calories - protein_calories - fat_calories
    carbs_g = max(carbs_calories / 4, 0)

    # Simple fiber target
    fiber_g = (calories / 1000) * 14

    return {
        "protein_g": round(protein_g, 2),
        "carbs_g": round(carbs_g, 2),
        "fat_g": round(fat_g, 2),
        "fiber_g": round(fiber_g, 2)
    }


def calculate_nutrition_targets(
    age: int,
    height_cm: float,
    weight_kg: float,
    activity_level: str,
    goal: str
) -> dict:

    bmr = calculate_bmr(
        age,
        height_cm,
        weight_kg
    )

    tdee = calculate_tdee(
        bmr,
        activity_level
    )

    daily_calories = calculate_daily_calories(
        tdee,
        goal
    )

    macros = calculate_macros(
        daily_calories,
        weight_kg
    )

    return {
        "bmr": bmr,
        "tdee": tdee,
        "daily_calorie_target": daily_calories,
        **macros
    }