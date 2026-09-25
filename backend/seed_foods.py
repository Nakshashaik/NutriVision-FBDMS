import json
from pathlib import Path

from database.database import SessionLocal
from database.models import Food


# =========================================================
# FILE PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

FOODS_FILE = BASE_DIR / "data" / "foods.json"


# =========================================================
# SEED FOODS
# =========================================================

def seed_foods():

    # -----------------------------------------------------
    # Check JSON file
    # -----------------------------------------------------

    if not FOODS_FILE.exists():

        print(
            f"Food file not found: {FOODS_FILE}"
        )

        return

    # -----------------------------------------------------
    # Read JSON
    # -----------------------------------------------------

    with open(
        FOODS_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        foods = json.load(file)

    # -----------------------------------------------------
    # Database session
    # -----------------------------------------------------

    db = SessionLocal()

    inserted = 0
    skipped = 0

    try:

        for food_data in foods:

            # ---------------------------------------------
            # Check duplicate
            # ---------------------------------------------

            existing_food = db.query(Food).filter(
                Food.name == food_data["name"]
            ).first()

            if existing_food:

                print(
                    f"SKIPPED: {food_data['name']}"
                )

                skipped += 1

                continue

            # ---------------------------------------------
            # Create food
            # ---------------------------------------------

            new_food = Food(

                name=food_data["name"],

                category=food_data["category"],

                serving_size_g=(
                    food_data["serving_size_g"]
                ),

                calories=(
                    food_data["calories"]
                ),

                protein_g=(
                    food_data["protein_g"]
                ),

                carbs_g=(
                    food_data["carbs_g"]
                ),

                fat_g=(
                    food_data["fat_g"]
                ),

                fiber_g=(
                    food_data["fiber_g"]
                )
            )

            db.add(new_food)

            inserted += 1

            print(
                f"INSERTED: {food_data['name']}"
            )

        # -------------------------------------------------
        # Commit
        # -------------------------------------------------

        db.commit()

        print()
        print("=" * 50)
        print("FOOD SEEDING COMPLETED")
        print("=" * 50)

        print(
            f"Inserted : {inserted}"
        )

        print(
            f"Skipped  : {skipped}"
        )

        print(
            f"Total    : {inserted + skipped}"
        )

    except Exception as e:

        db.rollback()

        print()
        print(
            "ERROR WHILE SEEDING FOODS:"
        )

        print(e)

    finally:

        db.close()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    seed_foods()