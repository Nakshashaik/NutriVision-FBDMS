import csv
from pathlib import Path

from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import Food


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

USDA_DIR = (
    BASE_DIR
    / "data"
    / "USDA"
    / "foundation"
    / "FoodData_Central_foundation_food_csv_2026-04-30"
)

FOOD_FILE = USDA_DIR / "food.csv"
FOOD_NUTRIENT_FILE = USDA_DIR / "food_nutrient.csv"
FOOD_CATEGORY_FILE = USDA_DIR / "food_category.csv"


# =========================================================
# USDA NUTRIENT IDs
# =========================================================

NUTRIENT_IDS = {
    "protein": "1003",
    "fat": "1004",
    "carbs": "1005",
    "calories": "1008",
    "fiber": "1079"
}


# =========================================================
# CSV HELPER
# =========================================================

def read_csv(file_path):

    with open(
        file_path,
        mode="r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        return list(csv.DictReader(file))


# =========================================================
# LOAD DATA
# =========================================================

print("Loading USDA Foundation Foods...")

foods = read_csv(FOOD_FILE)
food_nutrients = read_csv(FOOD_NUTRIENT_FILE)
categories = read_csv(FOOD_CATEGORY_FILE)

print(f"Foods loaded: {len(foods)}")
print(f"Nutrient records loaded: {len(food_nutrients)}")
print(f"Categories loaded: {len(categories)}")


# =========================================================
# CATEGORY LOOKUP
# =========================================================

category_lookup = {
    row["id"]: row["description"]
    for row in categories
}


# =========================================================
# FOUNDATION FOOD LOOKUP
# =========================================================

food_lookup = {}

for row in foods:

    if row["data_type"] != "foundation_food":
        continue

    fdc_id = row["fdc_id"]

    food_lookup[fdc_id] = row


# =========================================================
# NUTRIENT LOOKUP
# =========================================================

required_ids = set(
    NUTRIENT_IDS.values()
)

nutrient_lookup = {}


for row in food_nutrients:

    fdc_id = row["fdc_id"]
    nutrient_id = row["nutrient_id"]

    if nutrient_id not in required_ids:
        continue

    amount = row["amount"]

    if amount == "":
        continue

    try:
        amount = float(amount)
    except ValueError:
        continue

    if fdc_id not in nutrient_lookup:

        nutrient_lookup[fdc_id] = {}

    # Keep the first valid value for a nutrient.
    if nutrient_id not in nutrient_lookup[fdc_id]:

        nutrient_lookup[fdc_id][nutrient_id] = amount


# =========================================================
# DATABASE
# =========================================================

db: Session = SessionLocal()

inserted = 0
skipped = 0
duplicates = 0


# Track names already present in the database.
existing_names = {
    name[0]
    for name in db.query(Food.name).all()
}


# Track names inserted during this import.
imported_names = set()


try:

    for fdc_id, nutrient_data in nutrient_lookup.items():

        # -------------------------------------------------
        # Foundation food only
        # -------------------------------------------------

        food_data = food_lookup.get(fdc_id)

        if not food_data:
            continue


        # -------------------------------------------------
        # Food name
        # -------------------------------------------------

        food_name = food_data["description"].strip()

        if not food_name:

            skipped += 1
            continue


        # -------------------------------------------------
        # Required nutrients
        # -------------------------------------------------

        calories = nutrient_data.get(
            NUTRIENT_IDS["calories"]
        )

        protein = nutrient_data.get(
            NUTRIENT_IDS["protein"]
        )

        carbs = nutrient_data.get(
            NUTRIENT_IDS["carbs"]
        )

        fat = nutrient_data.get(
            NUTRIENT_IDS["fat"]
        )

        fiber = nutrient_data.get(
            NUTRIENT_IDS["fiber"]
        )


        # -------------------------------------------------
        # Reject incomplete records
        # -------------------------------------------------

        if any(
            value is None
            for value in [
                calories,
                protein,
                carbs,
                fat,
                fiber
            ]
        ):

            skipped += 1
            continue


        # -------------------------------------------------
        # Duplicate name check
        # -------------------------------------------------

        if food_name in existing_names:

            duplicates += 1
            continue


        if food_name in imported_names:

            duplicates += 1
            continue


        # -------------------------------------------------
        # Category
        # -------------------------------------------------

        category_id = food_data.get(
            "food_category_id"
        )

        category = category_lookup.get(
            category_id,
            "Other"
        )


        # -------------------------------------------------
        # Create food
        # -------------------------------------------------

        new_food = Food(

            name=food_name,

            category=category,

            serving_size_g=100,

            calories=calories,

            protein_g=protein,

            carbs_g=carbs,

            fat_g=fat,

            fiber_g=fiber,

            source="USDA FoodData Central",

            source_reference=(
                "Foundation Foods "
                "2026-04-30"
            ),

            source_food_id=fdc_id
        )


        db.add(new_food)

        imported_names.add(food_name)

        inserted += 1


        # -------------------------------------------------
        # Batch commit
        # -------------------------------------------------

        if inserted % 100 == 0:

            try:

                db.commit()

                existing_names.update(
                    imported_names
                )

                imported_names.clear()

                print(
                    f"Inserted {inserted} foods..."
                )

            except Exception as error:

                db.rollback()

                print(
                    "Batch commit failed:"
                )

                print(error)

                raise


    # -----------------------------------------------------
    # Final commit
    # -----------------------------------------------------

    try:

        db.commit()

    except Exception as error:

        db.rollback()

        print(
            "Final commit failed:"
        )

        print(error)

        raise


finally:

    db.close()


# =========================================================
# SUMMARY
# =========================================================

print()
print("=" * 50)
print("USDA FOOD IMPORT COMPLETE")
print("=" * 50)

print(f"Inserted   : {inserted}")
print(f"Duplicates : {duplicates}")
print(f"Skipped    : {skipped}")