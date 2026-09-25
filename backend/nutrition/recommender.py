from typing import Set, Optional


# ============================================================
# FOOD DIET COMPATIBILITY
# ============================================================

def is_food_compatible(food, diet_type: str) -> bool:
    """
    Check whether a food is broadly compatible with the
    user's selected diet.

    This is a rule-based baseline because USDA Foundation
    Foods does not provide a universal vegetarian/vegan label.
    """

    name = (food.name or "").lower()

    meat_keywords = [
        "chicken",
        "beef",
        "pork",
        "lamb",
        "mutton",
        "turkey",
        "duck",
        "goat",
        "venison",
        "meat",
        "sausage",
        "bacon",
        "ham",
        "salami",
        "pepperoni"
    ]

    seafood_keywords = [
        "fish",
        "salmon",
        "tuna",
        "shrimp",
        "prawn",
        "crab",
        "lobster",
        "anchovy",
        "sardine",
        "seafood"
    ]

    # Meat and seafood
    if any(word in name for word in meat_keywords):
        return diet_type == "non_vegetarian"

    if any(word in name for word in seafood_keywords):
        return diet_type == "non_vegetarian"

    # Eggs
    if "egg" in name:
        return diet_type in [
            "eggetarian",
            "non_vegetarian"
        ]

    # Vegan restrictions
    if diet_type == "vegan":

        dairy_keywords = [
            "milk",
            "cheese",
            "cheddar",
            "yogurt",
            "yoghurt",
            "curd",
            "butter",
            "cream",
            "whey",
            "casein",
            "paneer",
            "ghee",
            "lactose",
            "dairy"
        ]

        if any(word in name for word in dairy_keywords):
            return False

    return True


# ============================================================
# NUTRITIONAL GAPS
# ============================================================

def calculate_nutritional_gaps(
    targets: dict,
    consumed: dict
) -> dict:
    """
    Calculate the remaining nutritional requirements
    for the current day.
    """

    return {
        "calories": round(
            max(
                targets.get("calories", 0)
                - consumed.get("calories", 0),
                0
            ),
            2
        ),

        "protein_g": round(
            max(
                targets.get("protein_g", 0)
                - consumed.get("protein_g", 0),
                0
            ),
            2
        ),

        "carbs_g": round(
            max(
                targets.get("carbs_g", 0)
                - consumed.get("carbs_g", 0),
                0
            ),
            2
        ),

        "fat_g": round(
            max(
                targets.get("fat_g", 0)
                - consumed.get("fat_g", 0),
                0
            ),
            2
        ),

        "fiber_g": round(
            max(
                targets.get("fiber_g", 0)
                - consumed.get("fiber_g", 0),
                0
            ),
            2
        )
    }


# ============================================================
# FOOD CATEGORY / QUALITY
# ============================================================

def classify_food(food) -> str:
    """
    Classify foods into broad application-level groups.

    This classification is used only for ranking.
    """

    name = (food.name or "").lower()
    category = (food.category or "").lower()

    text = f"{name} {category}"

    # --------------------------------------------------------
    # Vegetables
    # --------------------------------------------------------

    vegetable_words = [
        "vegetable",
        "spinach",
        "broccoli",
        "carrot",
        "tomato",
        "potato",
        "onion",
        "garlic",
        "cabbage",
        "cauliflower",
        "pepper",
        "squash",
        "peas",
        "beans"
    ]

    if any(word in text for word in vegetable_words):
        return "vegetable"

    # --------------------------------------------------------
    # Fruits
    # --------------------------------------------------------

    fruit_words = [
        "fruit",
        "apple",
        "banana",
        "orange",
        "mango",
        "berry",
        "berries",
        "grape",
        "melon",
        "papaya",
        "pineapple",
        "pear",
        "peach",
        "fig"
    ]

    if any(word in text for word in fruit_words):
        return "fruit"

    # --------------------------------------------------------
    # Legumes
    # --------------------------------------------------------

    legume_words = [
        "legume",
        "lentil",
        "chickpea",
        "pea",
        "bean",
        "soy",
        "tofu",
        "hummus",
        "peanut"
    ]

    if any(word in text for word in legume_words):
        return "legume"

    # --------------------------------------------------------
    # Nuts and seeds
    # --------------------------------------------------------

    nut_words = [
        "nut",
        "almond",
        "walnut",
        "cashew",
        "pistachio",
        "pecan",
        "seed",
        "sunflower",
        "pumpkin",
        "chia",
        "flax"
    ]

    if any(word in text for word in nut_words):
        return "nut_seed"

    # --------------------------------------------------------
    # Whole grains
    # --------------------------------------------------------

    whole_grain_words = [
        "whole wheat",
        "whole-wheat",
        "oat",
        "oatmeal",
        "brown rice",
        "barley",
        "quinoa",
        "whole grain"
    ]

    if any(word in text for word in whole_grain_words):
        return "whole_grain"

    # --------------------------------------------------------
    # Dairy
    # --------------------------------------------------------

    dairy_words = [
        "milk",
        "yogurt",
        "yoghurt",
        "cheese",
        "curd",
        "paneer"
    ]

    if any(word in text for word in dairy_words):
        return "dairy"

    # --------------------------------------------------------
    # Eggs
    # --------------------------------------------------------

    if "egg" in name:
        return "egg"

    # --------------------------------------------------------
    # Restaurant food
    # --------------------------------------------------------

    if "restaurant" in category:
        return "restaurant"

    # --------------------------------------------------------
    # Processed / dessert foods
    # --------------------------------------------------------

    processed_words = [
        "cookie",
        "cake",
        "candy",
        "dessert",
        "donut",
        "doughnut",
        "pastry",
        "sweet",
        "chocolate",
        "chips",
        "cracker",
        "snack"
    ]

    if any(word in text for word in processed_words):
        return "processed"

    # --------------------------------------------------------
    # Bread
    # --------------------------------------------------------

    if "bread" in text:
        return "bread"

    # --------------------------------------------------------
    # Default
    # --------------------------------------------------------

    return "other"


# ============================================================
# FOOD QUALITY SCORE
# ============================================================

def calculate_food_quality_score(food) -> float:
    """
    Give a small ranking adjustment based on the type of food.

    This does NOT mean that foods are medically good or bad.
    It only controls recommendation priority.
    """

    food_type = classify_food(food)

    quality_scores = {

        "vegetable": 15,

        "fruit": 12,

        "legume": 15,

        "nut_seed": 10,

        "whole_grain": 10,

        "dairy": 6,

        "egg": 6,

        "bread": 4,

        "other": 0,

        "restaurant": -8,

        "processed": -12
    }

    return quality_scores.get(
        food_type,
        0
    )


# ============================================================
# CALORIE DENSITY PENALTY
# ============================================================

def calculate_calorie_penalty(
    calories: float
) -> float:
    """
    Penalize highly calorie-dense foods.

    Nutrition values are per 100g.
    """

    if calories <= 150:
        return 0

    if calories <= 250:
        return 2

    if calories <= 350:
        return 5

    if calories <= 450:
        return 8

    if calories <= 550:
        return 12

    if calories <= 650:
        return 18

    return 25


# ============================================================
# NUTRITION SCORE
# ============================================================

def calculate_food_score(
    food,
    nutritional_gaps: dict
) -> float:
    """
    Calculate the overall recommendation score.

    Maximum conceptual score is approximately 100.
    """

    calories = float(
        food.calories or 0
    )

    protein = float(
        food.protein_g or 0
    )

    carbs = float(
        food.carbs_g or 0
    )

    fat = float(
        food.fat_g or 0
    )

    fiber = float(
        food.fiber_g or 0
    )

    score = 0.0

    # --------------------------------------------------------
    # Protein
    # --------------------------------------------------------

    protein_gap = nutritional_gaps[
        "protein_g"
    ]

    if protein_gap > 0:

        protein_score = (
            protein / protein_gap
        ) * 100

        score += min(
            protein_score,
            35
        )

    # --------------------------------------------------------
    # Fiber
    # --------------------------------------------------------

    fiber_gap = nutritional_gaps[
        "fiber_g"
    ]

    if fiber_gap > 0:

        fiber_score = (
            fiber / fiber_gap
        ) * 100

        score += min(
            fiber_score,
            25
        )

    # --------------------------------------------------------
    # Carbohydrates
    # --------------------------------------------------------

    carbs_gap = nutritional_gaps[
        "carbs_g"
    ]

    if carbs_gap > 0:

        carbs_score = (
            carbs / carbs_gap
        ) * 100

        score += min(
            carbs_score,
            10
        )

    # --------------------------------------------------------
    # Fat
    # --------------------------------------------------------

    fat_gap = nutritional_gaps[
        "fat_g"
    ]

    if fat_gap > 0:

        fat_score = (
            fat / fat_gap
        ) * 100

        score += min(
            fat_score,
            5
        )

    # --------------------------------------------------------
    # Protein density
    # --------------------------------------------------------

    if calories > 0:

        protein_density = (
            protein / calories
        ) * 100

        score += min(
            protein_density * 0.5,
            10
        )

    # --------------------------------------------------------
    # Food quality
    # --------------------------------------------------------

    score += calculate_food_quality_score(
        food
    )

    # --------------------------------------------------------
    # Calorie penalty
    # --------------------------------------------------------

    score -= calculate_calorie_penalty(
        calories
    )

    return round(
        max(score, 0),
        2
    )


# ============================================================
# RECOMMENDATION REASON
# ============================================================

def generate_reason(
    food,
    nutritional_gaps: dict
) -> str:

    protein = float(
        food.protein_g or 0
    )

    fiber = float(
        food.fiber_g or 0
    )

    calories = float(
        food.calories or 0
    )

    food_type = classify_food(
        food
    )

    reasons = []

    # Protein
    if (
        nutritional_gaps["protein_g"] > 0
        and protein >= 10
    ):
        reasons.append(
            "supports your remaining protein needs"
        )

    # Fiber
    if (
        nutritional_gaps["fiber_g"] > 0
        and fiber >= 5
    ):
        reasons.append(
            "provides dietary fiber"
        )

    # Food type
    if food_type == "vegetable":
        reasons.append(
            "nutrient-dense vegetable option"
        )

    elif food_type == "fruit":
        reasons.append(
            "provides a fruit-based option"
        )

    elif food_type == "legume":
        reasons.append(
            "provides a plant-based protein option"
        )

    elif food_type == "nut_seed":
        reasons.append(
            "provides protein and healthy fats"
        )

    elif food_type == "whole_grain":
        reasons.append(
            "provides whole-grain carbohydrates"
        )

    # Calorie density
    if calories <= 200:
        reasons.append(
            "relatively moderate calorie density"
        )

    if not reasons:
        reasons.append(
            "contributes to your remaining nutrition"
        )

    return "; ".join(
        reasons[:3]
    )


# ============================================================
# SUGGESTED PORTION
# ============================================================

def calculate_suggested_portion(
    food,
    nutritional_gaps: dict
) -> int:

    calories = float(
        food.calories or 0
    )

    protein = float(
        food.protein_g or 0
    )

    food_type = classify_food(
        food
    )

    # --------------------------------------------------------
    # Base portions
    # --------------------------------------------------------

    portions = {

        "vegetable": 150,

        "fruit": 150,

        "legume": 100,

        "nut_seed": 30,

        "whole_grain": 75,

        "dairy": 150,

        "egg": 50,

        "bread": 60,

        "restaurant": 100,

        "processed": 30,

        "other": 100
    }

    portion = portions.get(
        food_type,
        100
    )

    # --------------------------------------------------------
    # High protein foods
    # --------------------------------------------------------

    if protein >= 15:

        portion = min(
            portion,
            100
        )

    # --------------------------------------------------------
    # Very calorie-dense foods
    # --------------------------------------------------------

    if calories >= 600:

        portion = min(
            portion,
            30
        )

    elif calories >= 500:

        portion = min(
            portion,
            40
        )

    elif calories >= 400:

        portion = min(
            portion,
            60
        )

    # --------------------------------------------------------
    # Remaining calorie budget
    # --------------------------------------------------------

    remaining_calories = (
        nutritional_gaps["calories"]
    )

    if calories > 0:

        maximum_portion = (
            remaining_calories
            / calories
        ) * 100

        portion = min(
            portion,
            int(maximum_portion)
        )

    # --------------------------------------------------------
    # Keep practical minimum
    # --------------------------------------------------------

    portion = max(
        portion,
        10
    )

    return int(
        portion
    )


# ============================================================
# MAIN RECOMMENDER
# ============================================================

def recommend_foods(
    foods,
    nutritional_gaps,
    diet_type,
    consumed_food_ids: Optional[Set[str]] = None,
    limit: int = 10
):

    if consumed_food_ids is None:
        consumed_food_ids = set()

    recommendations = []

    # --------------------------------------------------------
    # Examine foods
    # --------------------------------------------------------

    for food in foods:

        food_id = str(
            food.food_id
        )

        # ----------------------------------------------------
        # Diet filter
        # ----------------------------------------------------

        if not is_food_compatible(
            food,
            diet_type
        ):
            continue

        # ----------------------------------------------------
        # Avoid foods already consumed
        # ----------------------------------------------------

        if food_id in consumed_food_ids:
            continue

        # ----------------------------------------------------
        # Calculate score
        # ----------------------------------------------------

        score = calculate_food_score(
            food,
            nutritional_gaps
        )

        # ----------------------------------------------------
        # Suggested portion
        # ----------------------------------------------------

        suggested_portion = (
            calculate_suggested_portion(
                food,
                nutritional_gaps
            )
        )

        # ----------------------------------------------------
        # Explanation
        # ----------------------------------------------------

        reason = generate_reason(
            food,
            nutritional_gaps
        )

        # ----------------------------------------------------
        # Food type
        # ----------------------------------------------------

        food_type = classify_food(
            food
        )

        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        recommendations.append({

            "food_id": food_id,

            "food_name": food.name,

            "category": food.category,

            "food_type": food_type,

            "score": score,

            "reason": reason,

            "suggested_portion_g": (
                suggested_portion
            ),

            "nutrition_per_100g": {

                "calories": round(
                    float(food.calories or 0),
                    2
                ),

                "protein_g": round(
                    float(food.protein_g or 0),
                    2
                ),

                "carbs_g": round(
                    float(food.carbs_g or 0),
                    2
                ),

                "fat_g": round(
                    float(food.fat_g or 0),
                    2
                ),

                "fiber_g": round(
                    float(food.fiber_g or 0),
                    2
                )
            },

            "source": food.source,

            "source_food_id": (
                food.source_food_id
            )
        })

    # --------------------------------------------------------
    # Sort by score
    # --------------------------------------------------------

    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # --------------------------------------------------------
    # Return top results
    # --------------------------------------------------------

    return recommendations[:limit]