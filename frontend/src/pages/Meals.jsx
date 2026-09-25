import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Edit3,
  Utensils,
  Flame,
  Beef,
  Wheat,
  Leaf,
  X,
  LogOut,
} from "lucide-react";

import api from "../services/api";


// ============================================================
// MEAL TYPES
// ============================================================

const mealTypes = [
  {
    value: "breakfast",
    label: "Breakfast",
  },
  {
    value: "lunch",
    label: "Lunch",
  },
  {
    value: "dinner",
    label: "Dinner",
  },
  {
    value: "snack",
    label: "Snacks",
  },
];


// ============================================================
// MEALS PAGE
// ============================================================

function Meals() {
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);

  const [selectedMeal, setSelectedMeal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [foodLoading, setFoodLoading] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);

  const [mealType, setMealType] = useState("breakfast");

  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");


  // ==========================================================
  // FETCH MEALS
  // ==========================================================

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/meals");

      setMeals(
        response.data?.meals ||
        response.data ||
        []
      );

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.detail ||
        "Unable to load your meals."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // FETCH FOODS
  // ==========================================================

  const fetchFoods = async () => {
    try {
      setFoodLoading(true);

      const response = await api.get("/api/foods");

      const foodData =
        response.data?.foods ||
        response.data ||
        [];

      console.log("Foods loaded:", foodData.length);

      setFoods(foodData);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load foods."
      );

    } finally {
      setFoodLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchMeals();
    fetchFoods();
  }, []);


  // ==========================================================
  // CREATE MEAL
  // ==========================================================

  const createMeal = async () => {
    try {
      setError("");

      const response = await api.post(
        "/api/meals",
        {
          meal_type: mealType,
        }
      );

      const newMeal = response.data;

      setMeals((previous) => [
        ...previous,
        newMeal,
      ]);

      setShowCreateMeal(false);
      setSelectedMeal(newMeal);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to create the meal."
      );
    }
  };


  // ==========================================================
  // ADD FOOD TO MEAL
  // ==========================================================

  const addFoodToMeal = async () => {

    if (!selectedMeal || !selectedFood) {
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      setError("");

      await api.post(
        `/api/meals/${selectedMeal.meal_id}/items`,
        {
          food_id: selectedFood.food_id,
          quantity_g: Number(quantity),
        }
      );

      setQuantity("");
      setSelectedFood(null);
      setShowAddFood(false);
      setSearch("");

      await fetchMeals();

      const refreshed =
        await api.get("/api/meals");

      const refreshedMeals =
        refreshed.data?.meals ||
        refreshed.data ||
        [];

      setMeals(refreshedMeals);

      const updatedMeal =
        refreshedMeals.find(
          (meal) =>
            String(meal.meal_id) ===
            String(selectedMeal.meal_id)
        );

      setSelectedMeal(
        updatedMeal || null
      );

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to add food to this meal."
      );
    }
  };


  // ==========================================================
  // UPDATE FOOD QUANTITY
  // ==========================================================

  const updateFoodQuantity = async (
    mealId,
    itemId
  ) => {

    if (
      !editQuantity ||
      Number(editQuantity) <= 0
    ) {
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      setError("");

      await api.put(
        `/api/meals/${mealId}/items/${itemId}`,
        {
          quantity_g: Number(editQuantity),
        }
      );

      setEditingItem(null);
      setEditQuantity("");

      await fetchMeals();

      const refreshed =
        await api.get("/api/meals");

      const refreshedMeals =
        refreshed.data?.meals ||
        refreshed.data ||
        [];

      setMeals(refreshedMeals);

      const updatedMeal =
        refreshedMeals.find(
          (meal) =>
            String(meal.meal_id) ===
            String(mealId)
        );

      setSelectedMeal(
        updatedMeal || null
      );

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to update the food quantity."
      );
    }
  };


  // ==========================================================
  // DELETE FOOD FROM MEAL
  // ==========================================================

  const deleteFood = async (
    mealId,
    itemId
  ) => {

    try {
      setError("");

      await api.delete(
        `/api/meals/${mealId}/items/${itemId}`
      );

      await fetchMeals();

      const refreshed =
        await api.get("/api/meals");

      const refreshedMeals =
        refreshed.data?.meals ||
        refreshed.data ||
        [];

      setMeals(refreshedMeals);

      const updatedMeal =
        refreshedMeals.find(
          (meal) =>
            String(meal.meal_id) ===
            String(mealId)
        );

      setSelectedMeal(
        updatedMeal || null
      );

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to remove the food."
      );
    }
  };


  // ==========================================================
  // DELETE MEAL
  // ==========================================================

  const deleteMeal = async (
    mealId
  ) => {

    try {
      setError("");

      await api.delete(
        `/api/meals/${mealId}`
      );

      setSelectedMeal(null);

      await fetchMeals();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to delete the meal."
      );
    }
  };


  // ==========================================================
  // SEARCH FOODS
  // ==========================================================

  const filteredFoods =
    foods.filter((food) =>
      String(food.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F2E8]">

        <div className="text-center">

          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#DDE7D7] border-t-[#1F4D3A]" />

          <p className="text-sm text-[#68736C]">
            Loading your meals...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F6F2E8]">

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between rounded-[22px] border border-white/70 bg-[#FFFDF8]/95 px-5 py-3 shadow-[0_8px_30px_rgba(40,60,45,0.08)] backdrop-blur-xl sm:px-7">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F0E3]">

              <Utensils
                size={20}
                className="text-[#2D653B]"
              />

            </div>

            <div>

              <h1 className="text-xl font-semibold tracking-tight text-[#173428]">
                FBDMS
              </h1>

              <p className="text-[8px] font-semibold uppercase tracking-[0.27em] text-[#778078]">
                Eat well. Live well.
              </p>

            </div>

          </Link>


          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/dashboard"
              className="text-sm text-[#747D77] hover:text-[#173F2D]"
            >
              Dashboard
            </Link>

            <span className="text-sm font-semibold text-[#173F2D]">
              Meals
            </span>

            <Link
              to="/analytics"
              className="text-sm text-[#747D77] hover:text-[#173F2D]"
            >
              Analytics
            </Link>

            <Link
              to="/profile-setup"
              className="text-sm text-[#747D77] hover:text-[#173F2D]"
            >
              Profile
            </Link>

          </nav>


          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="rounded-lg p-2 text-[#667169] transition hover:text-red-600"
            title="Logout"
          >

            <LogOut size={19} />

          </button>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1450px] px-5 pb-16 pt-8 sm:px-7 lg:px-10">

        {/* HEADER */}

        <section className="mb-8">

          <Link
            to="/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm text-[#68736C] transition hover:text-[#173F2D]"
          >

            <ArrowLeft size={16} />

            Back to dashboard

          </Link>


          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#56825A]">
                Meal management
              </p>

              <h1 className="font-serif text-4xl tracking-tight text-[#13251C] sm:text-5xl">
                Your meals
              </h1>

              <p className="mt-2 text-base text-[#737B75]">
                Build your meals and keep track of what you eat.
              </p>

            </div>


            <button
              onClick={() =>
                setShowCreateMeal(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F4D3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163A2B]"
            >

              <Plus size={17} />

              Create meal

            </button>

          </div>

        </section>


        {/* ERROR */}

        {error && (

          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="p-1"
            >

              <X size={16} />

            </button>

          </div>

        )}


        {/* ====================================================
            MEAL LIST
        ===================================================== */}

        {meals.length === 0 ? (

          <div className="rounded-[24px] border border-dashed border-[#CDD7CA] bg-[#FFFDF8] p-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F0E5]">

              <Utensils
                size={23}
                className="text-[#4D7A50]"
              />

            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#17271F]">
              No meals yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7B847D]">
              Create your first meal and start adding foods to track your daily nutrition.
            </p>

            <button
              onClick={() =>
                setShowCreateMeal(true)
              }
              className="mt-6 rounded-full bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-white"
            >
              Create your first meal
            </button>

          </div>

        ) : (

          <div className="grid gap-5 lg:grid-cols-2">

            {meals.map((meal) => (

              <MealPanel
                key={meal.meal_id}
                meal={meal}

                onSelect={() =>
                  setSelectedMeal(meal)
                }

                onAddFood={() => {
                  setSelectedMeal(meal);
                  setShowAddFood(true);
                }}

                onDelete={() =>
                  deleteMeal(
                    meal.meal_id
                  )
                }

                onEdit={(item) => {
                  setSelectedMeal(meal);
                  setEditingItem(item);
                  setEditQuantity(
                    item.quantity_g || ""
                  );
                }}

                onDeleteFood={(itemId) =>
                  deleteFood(
                    meal.meal_id,
                    itemId
                  )
                }

              />

            ))}

          </div>

        )}

      </main>


      {/* ======================================================
          CREATE MEAL MODAL
      ====================================================== */}

      {showCreateMeal && (

        <Modal
          title="Create a meal"
          onClose={() =>
            setShowCreateMeal(false)
          }
        >

          <p className="text-sm text-[#747D77]">
            Choose the type of meal you want to create.
          </p>


          <div className="mt-5 grid grid-cols-2 gap-3">

            {mealTypes.map((type) => (

              <button
                key={type.value}
                onClick={() =>
                  setMealType(
                    type.value
                  )
                }
                className={`rounded-xl border px-4 py-4 text-sm font-medium transition ${
                  mealType === type.value
                    ? "border-[#7A9B72] bg-[#E8F0E1] text-[#315C37]"
                    : "border-[#E0E3D9] bg-white text-[#68736C] hover:bg-[#F5F7F1]"
                }`}
              >

                {type.label}

              </button>

            ))}

          </div>


          <button
            onClick={createMeal}
            className="mt-6 w-full rounded-xl bg-[#1F4D3A] py-3 text-sm font-semibold text-white transition hover:bg-[#163A2B]"
          >
            Create meal
          </button>

        </Modal>

      )}


      {/* ======================================================
          ADD FOOD MODAL
      ====================================================== */}

      {showAddFood && selectedMeal && (

        <Modal
          title={`Add food to ${formatMealType(
            selectedMeal.meal_type
          )}`}
          onClose={() => {
            setShowAddFood(false);
            setSelectedFood(null);
            setSearch("");
            setQuantity("");
          }}
        >

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879087]"
            />

            <input
              type="text"
              placeholder="Search foods..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#DDE1D8] bg-[#FAFBF7] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#6D9365]"
            />

          </div>


          {/* FOOD LIST */}

          <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto">

            {foodLoading ? (

              <p className="py-8 text-center text-sm text-[#7B847D]">
                Loading foods...
              </p>

            ) : filteredFoods.length === 0 ? (

              <p className="py-8 text-center text-sm text-[#7B847D]">
                No foods found.
              </p>

            ) : (

              filteredFoods
                .slice(0, 30)
                .map((food) => (

                  <button
                    key={food.food_id}
                    onClick={() =>
                      setSelectedFood(food)
                    }
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedFood?.food_id ===
                      food.food_id
                        ? "border-[#7A9B72] bg-[#E8F0E1]"
                        : "border-[#E5E7E0] bg-white hover:bg-[#F5F7F1]"
                    }`}
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-sm font-medium text-[#27342C]">
                          {food.name}
                        </p>

                        <p className="mt-1 text-xs text-[#89918B]">
                          {food.category}
                        </p>

                      </div>


                      <span className="shrink-0 text-xs text-[#68736C]">
                        {Number(
                          food.calories || 0
                        ).toFixed(0)}{" "}
                        kcal
                      </span>

                    </div>

                  </button>

                ))

            )}

          </div>


          {/* QUANTITY */}

          {selectedFood && (

            <div className="mt-5 rounded-xl bg-[#F1F4EC] p-4">

              <p className="text-sm font-medium text-[#27342C]">
                {selectedFood.name}
              </p>

              <p className="mt-1 text-xs text-[#7B847D]">
                Enter the amount you consumed.
              </p>


              <div className="mt-3 flex items-center gap-3">

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  className="flex-1 rounded-xl border border-[#D8DDD3] bg-white px-4 py-3 text-sm outline-none focus:border-[#6D9365]"
                />

                <span className="text-sm font-medium text-[#68736C]">
                  grams
                </span>

              </div>

            </div>

          )}


          <button
            onClick={addFoodToMeal}
            disabled={!selectedFood}
            className="mt-5 w-full rounded-xl bg-[#1F4D3A] py-3 text-sm font-semibold text-white transition hover:bg-[#163A2B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add food
          </button>

        </Modal>

      )}


      {/* ======================================================
          EDIT QUANTITY MODAL
      ====================================================== */}

      {editingItem && selectedMeal && (

        <Modal
          title="Update quantity"
          onClose={() => {
            setEditingItem(null);
            setEditQuantity("");
          }}
        >

          <p className="text-sm text-[#747D77]">
            Change the quantity consumed for this food.
          </p>


          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium text-[#35423A]">
              Quantity (grams)
            </label>

            <input
              type="number"
              min="1"
              value={editQuantity}
              onChange={(e) =>
                setEditQuantity(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#D8DDD3] bg-white px-4 py-3 text-sm outline-none focus:border-[#6D9365]"
            />

          </div>


          <button
            onClick={() =>
              updateFoodQuantity(
                selectedMeal.meal_id,
                editingItem.meal_item_id
              )
            }
            className="mt-5 w-full rounded-xl bg-[#1F4D3A] py-3 text-sm font-semibold text-white hover:bg-[#163A2B]"
          >
            Save changes
          </button>

        </Modal>

      )}

    </div>
  );
}


// ============================================================
// MEAL PANEL
// ============================================================

function MealPanel({
  meal,
  onAddFood,
  onDelete,
  onEdit,
  onDeleteFood,
}) {

  const items = meal.items || [];

  const nutrition =
    calculateMealNutrition(meal);


  return (
    <article className="overflow-hidden rounded-[22px] border border-white/80 bg-[#FFFDF8] shadow-[0_10px_35px_rgba(40,55,40,0.07)]">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-[#E7E8E1] px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F0E1]">

            <Utensils
              size={19}
              className="text-[#477347]"
            />

          </div>


          <div>

            <h2 className="font-serif text-2xl text-[#17271F]">
              {formatMealType(
                meal.meal_type
              )}
            </h2>

            <p className="text-xs text-[#89918B]">

              {items.length}{" "}

              {items.length === 1
                ? "food"
                : "foods"}

            </p>

          </div>

        </div>


        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-[#9A817D] transition hover:bg-red-50 hover:text-red-600"
          title="Delete meal"
        >

          <Trash2 size={17} />

        </button>

      </div>


      {/* NUTRITION */}

      <div className="grid grid-cols-2 border-b border-[#E7E8E1] sm:grid-cols-4">

        <NutritionStat
          icon={Flame}
          label="Calories"
          value={Math.round(
            nutrition.calories
          )}
          unit="kcal"
        />

        <NutritionStat
          icon={Beef}
          label="Protein"
          value={nutrition.protein.toFixed(1)}
          unit="g"
        />

        <NutritionStat
          icon={Wheat}
          label="Carbs"
          value={nutrition.carbs.toFixed(1)}
          unit="g"
        />

        <NutritionStat
          icon={Leaf}
          label="Fiber"
          value={nutrition.fiber.toFixed(1)}
          unit="g"
        />

      </div>


      {/* FOOD ITEMS */}

      <div className="px-6 py-5">

        {items.length === 0 ? (

          <div className="py-5 text-center">

            <p className="text-sm text-[#7B847D]">
              No foods added to this meal yet.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {items.map((item) => (

              <div
                key={item.meal_item_id}
                className="flex items-center justify-between gap-4 rounded-xl bg-[#F7F8F3] px-4 py-3"
              >

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium text-[#27342C]">
                    {item.food_name ||
                      item.name ||
                      "Food"}
                  </p>

                  <p className="mt-1 text-xs text-[#89918B]">

                    {Number(
                      item.quantity_g || 0
                    )}{" "}
                    g

                    {" · "}

                    {Math.round(
                      Number(
                        item.calories || 0
                      )
                    )}{" "}
                    kcal

                  </p>

                </div>


                <div className="flex shrink-0 items-center gap-1">

                  <button
                    onClick={() =>
                      onEdit(item)
                    }
                    className="rounded-lg p-2 text-[#718077] hover:bg-white hover:text-[#315C37]"
                    title="Edit quantity"
                  >

                    <Edit3 size={15} />

                  </button>


                  <button
                    onClick={() =>
                      onDeleteFood(
                        item.meal_item_id
                      )
                    }
                    className="rounded-lg p-2 text-[#9A817D] hover:bg-white hover:text-red-600"
                    title="Remove food"
                  >

                    <Trash2 size={15} />

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}


        {/* ADD FOOD */}

        <button
          onClick={onAddFood}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#BFCDBA] py-3 text-sm font-medium text-[#477347] transition hover:bg-[#F2F6ED]"
        >

          <Plus size={16} />

          Add food

        </button>

      </div>

    </article>
  );
}


// ============================================================
// NUTRITION STAT
// ============================================================

function NutritionStat({
  icon: Icon,
  label,
  value,
  unit,
}) {

  return (
    <div className="border-r border-[#E7E8E1] px-4 py-4 last:border-r-0">

      <div className="flex items-center gap-2">

        <Icon
          size={14}
          className="text-[#62845F]"
        />

        <span className="text-[10px] uppercase tracking-wide text-[#89918B]">
          {label}
        </span>

      </div>


      <p className="mt-1 text-sm font-semibold text-[#27342C]">

        {value}{" "}

        <span className="text-[10px] font-normal text-[#89918B]">
          {unit}
        </span>

      </p>

    </div>
  );
}


// ============================================================
// MODAL
// ============================================================

function Modal({
  title,
  children,
  onClose,
}) {

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#16251D]/45 px-5 backdrop-blur-sm">

      <div className="w-full max-w-lg overflow-hidden rounded-[24px] bg-[#FFFDF8] shadow-[0_25px_80px_rgba(20,40,28,0.25)]">

        <div className="flex items-center justify-between border-b border-[#E5E7E0] px-6 py-5">

          <h2 className="font-serif text-2xl text-[#17271F]">
            {title}
          </h2>


          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#7B847D] hover:bg-[#F1F3ED]"
          >

            <X size={18} />

          </button>

        </div>


        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}


// ============================================================
// CALCULATE MEAL NUTRITION
// ============================================================

function calculateMealNutrition(meal) {

  const items = meal.items || [];

  return items.reduce(
    (total, item) => {

      total.calories +=
        Number(item.calories) || 0;

      total.protein +=
        Number(item.protein_g) || 0;

      total.carbs +=
        Number(item.carbs_g) || 0;

      total.fiber +=
        Number(item.fiber_g) || 0;

      return total;

    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0,
    }
  );
}


// ============================================================
// FORMAT MEAL TYPE
// ============================================================

function formatMealType(type) {

  if (!type) {
    return "Meal";
  }

  if (type === "snack") {
    return "Snacks";
  }

  return (
    type.charAt(0).toUpperCase() +
    type.slice(1)
  );
}


export default Meals;