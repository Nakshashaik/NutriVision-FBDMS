import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  CalendarDays,
  ChevronRight,
  LogOut,
  Plus,
  UserRound,
  Utensils,
  Flame,
  TrendingUp,
  X,
  Check,
} from "lucide-react";

import api from "../services/api";

import dashboardBg from "../assets/dashboard-bg.png";
import calorieBg from "../assets/Calorie-bg.png";
import breakfastImage from "../assets/breakfast.png";
import lunchImage from "../assets/lunch.png";
import dinnerImage from "../assets/dinner.png";
import snacksImage from "../assets/snacks.png";


// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  const navigate = useNavigate();

  const [nutrition, setNutrition] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [meals, setMeals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recommendation integration
  const [selectedRecommendation, setSelectedRecommendation] =
    useState(null);

  const [showMealSelector, setShowMealSelector] =
    useState(false);

  const [addingRecommendation, setAddingRecommendation] =
    useState(false);

  const [recommendationMessage, setRecommendationMessage] =
    useState("");

  // ==========================================================
  // FETCH DASHBOARD DATA
  // ==========================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        nutritionResponse,
        recommendationResponse,
        mealsResponse,
      ] = await Promise.all([
        api.get("/api/nutrition/today"),
        api.get("/api/recommendations?limit=6"),
        api.get("/api/meals"),
      ]);

      setNutrition(nutritionResponse.data);

      setRecommendations(
        recommendationResponse.data?.recommendations || []
      );

      setMeals(
        mealsResponse.data?.meals ||
        mealsResponse.data ||
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
        "We couldn't load your nutrition data."
      );
    } finally {
      setLoading(false);
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

    fetchDashboardData();
  }, []);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  // ==========================================================
  // FIND EXISTING MEAL
  // ==========================================================

  const getFullMeal = (mealType) => {
    return meals.find(
      (meal) => meal.meal_type === mealType
    );
  };


  // ==========================================================
  // ADD RECOMMENDATION TO MEAL
  // ==========================================================

  const addRecommendationToMeal = async (
    food,
    mealType
  ) => {
    try {
      setAddingRecommendation(true);
      setRecommendationMessage("");

      const suggestedQuantity =
        Number(food.suggested_portion_g) || 30;


      // ------------------------------------------------------
      // CHECK IF MEAL ALREADY EXISTS
      // ------------------------------------------------------

      let existingMeal = getFullMeal(mealType);

      let mealId = existingMeal?.meal_id;


      // ------------------------------------------------------
      // CREATE MEAL IF NEEDED
      // ------------------------------------------------------

      if (!mealId) {
        const mealResponse = await api.post(
          "/api/meals",
          {
            meal_type: mealType,
          }
        );

        mealId = mealResponse.data?.meal_id;
      }


      if (!mealId) {
        throw new Error(
          "Unable to create or find the selected meal."
        );
      }


      // ------------------------------------------------------
      // ADD FOOD TO MEAL
      // ------------------------------------------------------

      await api.post(
        `/api/meals/${mealId}/items`,
        {
          food_id: food.food_id,
          quantity_g: suggestedQuantity,
        }
      );


      // ------------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------------

      setRecommendationMessage(
        `${food.food_name} added to ${formatMealType(
          mealType
        )}.`
      );


      // ------------------------------------------------------
      // CLOSE SELECTOR
      // ------------------------------------------------------

      setShowMealSelector(false);
      setSelectedRecommendation(null);


      // ------------------------------------------------------
      // REFRESH ALL DASHBOARD DATA
      // ------------------------------------------------------

      await fetchDashboardData();

    } catch (err) {
      console.error(err);

      setRecommendationMessage(
        err.response?.data?.detail ||
        err.message ||
        "Unable to add this recommendation."
      );

    } finally {
      setAddingRecommendation(false);
    }
  };


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F2E8]">

        <div className="text-center">

          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#DDE7D7] border-t-[#1F4D3A]" />

          <p className="text-sm text-[#68736C]">
            Preparing your nutrition overview...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F2E8] px-6">

        <div className="w-full max-w-md rounded-[24px] bg-[#FFFDF8] p-8 text-center shadow-lg">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0E5]">

            <TrendingUp
              size={22}
              className="text-[#3E7548]"
            />

          </div>

          <h1 className="mt-5 text-xl font-semibold text-[#17271F]">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#717B74]">
            {error}
          </p>

          <button
            onClick={fetchDashboardData}
            className="mt-6 rounded-xl bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#163A2B]"
          >
            Try again
          </button>

        </div>

      </div>
    );
  }


  // ==========================================================
  // NUTRITION VALUES
  // ==========================================================

  const consumedCalories =
    Number(nutrition?.consumed?.calories) || 0;

  const targetCalories =
    Number(nutrition?.targets?.calories) || 0;

  const remainingCalories =
    Number(nutrition?.remaining?.calories) || 0;

  const calorieProgress =
    targetCalories > 0
      ? Math.min(
          (consumedCalories / targetCalories) * 100,
          100
        )
      : 0;


  // ==========================================================
  // GET NUTRITION MEAL
  // ==========================================================

  const getNutritionMeal = (mealType) => {
    return nutrition?.meals?.find(
      (meal) => meal.meal_type === mealType
    );
  };


  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div
      className="min-h-screen bg-[#F6F2E8] bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(246,242,232,0.90),
            rgba(246,242,232,0.94)
          ),
          url(${dashboardBg})
        `,
      }}
    >

      {/* ====================================================
          NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between rounded-[22px] border border-white/70 bg-[#FFFDF8]/90 px-5 py-3 shadow-[0_8px_30px_rgba(40,60,45,0.08)] backdrop-blur-xl sm:px-7">


          {/* BRAND */}

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F0E3]">

              <svg
                viewBox="0 0 40 40"
                className="h-7 w-7"
                fill="none"
              >

                <path
                  d="M20 32V13"
                  stroke="#2D653B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M20 19C14 18 10 14 10 8C16 8 20 12 20 19Z"
                  fill="#4D874E"
                />

                <path
                  d="M20 24C26 23 30 19 30 13C24 13 20 17 20 24Z"
                  fill="#6DA45E"
                />

              </svg>

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


          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/dashboard"
              className="relative py-2 text-sm font-semibold text-[#173F2D]"
            >

              Dashboard

              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#3E7047]" />

            </Link>


            <Link
              to="/meals"
              className="flex items-center gap-2 py-2 text-sm text-[#747D77] transition hover:text-[#173F2D]"
            >

              <Utensils size={15} />

              Meals

            </Link>


            <Link
              to="/analytics"
              className="flex items-center gap-2 py-2 text-sm text-[#747D77] transition hover:text-[#173F2D]"
            >

              <TrendingUp size={15} />

              Analytics

            </Link>


            <Link
              to="/profile-setup"
              className="flex items-center gap-2 py-2 text-sm text-[#747D77] transition hover:text-[#173F2D]"
            >

              <UserRound size={15} />

              Profile

            </Link>


            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 text-sm text-[#747D77] transition hover:text-red-600"
            >

              <LogOut size={15} />

              Logout

            </button>

          </nav>


          {/* MOBILE LOGOUT */}

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-[#667169] md:hidden"
          >

            <LogOut size={19} />

          </button>

        </div>

      </header>


      {/* ====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-[1450px] px-5 pb-16 pt-8 sm:px-7 lg:px-10">


        {/* ==================================================
            HERO
        =================================================== */}

        <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#56825A]">
              Your daily nutrition
            </p>

            <h1 className="font-serif text-4xl leading-tight tracking-tight text-[#13251C] sm:text-5xl lg:text-[52px]">
              Good to see you.
            </h1>

            <p className="mt-2 text-base text-[#737B75]">
              Here's how your nutrition looks today.
            </p>

          </div>


          {/* DATE */}

          <div className="flex items-center gap-2 self-start rounded-xl border border-[#E0E3D9] bg-[#FFFDF8]/90 px-4 py-2.5 text-sm text-[#59635C] shadow-sm lg:self-auto">

            <CalendarDays
              size={16}
              className="text-[#5B805D]"
            />

            <span>
              {formatDate(nutrition?.date)}
            </span>

          </div>

        </section>


        {/* ==================================================
            CALORIES + MACROS
        =================================================== */}

        <section className="grid gap-5 lg:grid-cols-[1.04fr_1.1fr]">


          {/* CALORIE CARD */}

          <div className="relative min-h-[250px] overflow-hidden rounded-[22px] shadow-[0_15px_45px_rgba(25,50,34,0.12)]">

            <img
              src={calorieBg}
              alt="Nutrition and calorie background"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#102F21]/95 via-[#173F2C]/75 to-[#173F2C]/30" />


            <div className="relative z-10 flex h-full min-h-[250px] flex-col justify-between p-7 text-white sm:p-8">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-white/70">
                    Calories today
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">

                    <span className="font-serif text-5xl tracking-tight sm:text-6xl">
                      {Math.round(consumedCalories)}
                    </span>

                    <span className="text-sm text-white/65">
                      / {Math.round(targetCalories)} kcal
                    </span>

                  </div>

                </div>


                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">

                  <Flame
                    size={19}
                    strokeWidth={1.7}
                  />

                </div>

              </div>


              <div>

                <div className="h-2 overflow-hidden rounded-full bg-white/20">

                  <div
                    className="h-full rounded-full bg-[#D9E9C9] transition-all duration-700"
                    style={{
                      width: `${calorieProgress}%`,
                    }}
                  />

                </div>

                <div className="mt-3 flex justify-between text-xs">

                  <span className="text-white/65">
                    {Math.round(calorieProgress)}% of daily target
                  </span>

                  <span className="font-medium text-white">
                    {Math.round(remainingCalories)} kcal remaining
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* NUTRITION PROGRESS */}

          <div className="rounded-[22px] border border-white/80 bg-[#FFFDF8]/90 p-7 shadow-[0_12px_40px_rgba(45,60,45,0.07)] backdrop-blur-md sm:p-8">

            <div className="mb-7">

              <h2 className="font-serif text-2xl text-[#17271F]">
                Nutrition progress
              </h2>

              <p className="mt-1 text-sm text-[#7A817B]">
                Your progress toward today's targets
              </p>

            </div>


            <div className="space-y-5">

              <MacroRow
                label="Protein"
                consumed={nutrition?.consumed?.protein_g}
                target={nutrition?.targets?.protein_g}
                progress={nutrition?.progress?.protein}
              />

              <MacroRow
                label="Carbohydrates"
                consumed={nutrition?.consumed?.carbs_g}
                target={nutrition?.targets?.carbs_g}
                progress={nutrition?.progress?.carbs}
              />

              <MacroRow
                label="Fat"
                consumed={nutrition?.consumed?.fat_g}
                target={nutrition?.targets?.fat_g}
                progress={nutrition?.progress?.fat}
              />

              <MacroRow
                label="Fiber"
                consumed={nutrition?.consumed?.fiber_g}
                target={nutrition?.targets?.fiber_g}
                progress={nutrition?.progress?.fiber}
              />

            </div>

          </div>

        </section>


        {/* ==================================================
            TODAY'S MEALS
        =================================================== */}

        <section className="mt-9">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <h2 className="font-serif text-3xl text-[#17271F]">
                Today's meals
              </h2>

              <p className="mt-1 text-sm text-[#7A817B]">
                Track your meals throughout the day
              </p>

            </div>


            <Link
              to="/meals"
              className="hidden items-center gap-2 rounded-full bg-[#E8F0DE] px-5 py-2.5 text-sm font-medium text-[#315C37] transition hover:bg-[#DCE9D0] sm:flex"
            >

              <Plus size={16} />

              Add meal

            </Link>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <MealCard
              title="Breakfast"
              image={breakfastImage}
              nutritionMeal={getNutritionMeal("breakfast")}
              fullMeal={getFullMeal("breakfast")}
            />

            <MealCard
              title="Lunch"
              image={lunchImage}
              nutritionMeal={getNutritionMeal("lunch")}
              fullMeal={getFullMeal("lunch")}
            />

            <MealCard
              title="Dinner"
              image={dinnerImage}
              nutritionMeal={getNutritionMeal("dinner")}
              fullMeal={getFullMeal("dinner")}
            />

            <MealCard
              title="Snacks"
              image={snacksImage}
              nutritionMeal={getNutritionMeal("snack")}
              fullMeal={getFullMeal("snack")}
            />

          </div>

        </section>


        {/* ==================================================
            RECOMMENDATIONS
        =================================================== */}

        <section className="mt-10">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <h2 className="font-serif text-3xl text-[#17271F]">
                Recommended foods
              </h2>

              <p className="mt-1 text-sm text-[#7A817B]">
                Suggestions based on your remaining nutrition needs.
              </p>

            </div>


            <Link
              to="/meals"
              className="hidden items-center gap-2 rounded-full bg-[#E8F0DE] px-5 py-2.5 text-sm font-medium text-[#315C37] transition hover:bg-[#DCE9D0] sm:flex"
            >

              View all

              <ChevronRight size={16} />

            </Link>

          </div>


          {recommendations.length === 0 ? (

            <div className="rounded-[22px] border border-dashed border-[#CDD7CA] bg-[#FFFDF8]/80 p-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0E5]">

                <Utensils
                  size={20}
                  className="text-[#4D7A50]"
                />

              </div>

              <h3 className="mt-4 font-semibold text-[#26362C]">
                No recommendations yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-[#7B847D]">
                Add your profile and meals to receive
                personalized food suggestions.
              </p>

            </div>

          ) : (

            <div className="grid gap-4 lg:grid-cols-3">

              {recommendations
                .slice(0, 3)
                .map((food) => (

                  <RecommendationCard
                    key={food.food_id}
                    food={food}
                    onAdd={(selectedFood) => {
                      setSelectedRecommendation(
                        selectedFood
                      );

                      setRecommendationMessage("");

                      setShowMealSelector(true);
                    }}
                  />

                ))}

            </div>

          )}

        </section>

      </main>


      {/* ====================================================
          ADD RECOMMENDATION MODAL
      ===================================================== */}

      {showMealSelector && selectedRecommendation && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[24px] bg-[#FFFDF8] p-6 shadow-[0_25px_80px_rgba(30,45,35,0.22)] sm:p-7">


            {/* HEADER */}

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#56825A]">
                  Add recommendation
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#17271F]">
                  {selectedRecommendation.food_name}
                </h2>

              </div>


              <button
                onClick={() => {
                  setShowMealSelector(false);
                  setSelectedRecommendation(null);
                  setRecommendationMessage("");
                }}
                className="rounded-lg p-2 text-[#7A817B] transition hover:bg-[#F0F2EC]"
              >

                <X size={18} />

              </button>

            </div>


            {/* PORTION */}

            <div className="mt-5 rounded-xl bg-[#F2F6ED] px-4 py-3">

              <div className="flex items-center justify-between">

                <span className="text-sm text-[#667169]">
                  Suggested portion
                </span>

                <span className="font-semibold text-[#315C37]">
                  {selectedRecommendation.suggested_portion_g} g
                </span>

              </div>

            </div>


            {/* CHOOSE MEAL */}

            <p className="mt-6 text-sm font-medium text-[#354239]">
              Where would you like to add it?
            </p>


            <div className="mt-3 grid grid-cols-2 gap-3">

              <MealChoiceButton
                label="Breakfast"
                disabled={addingRecommendation}
                onClick={() =>
                  addRecommendationToMeal(
                    selectedRecommendation,
                    "breakfast"
                  )
                }
              />

              <MealChoiceButton
                label="Lunch"
                disabled={addingRecommendation}
                onClick={() =>
                  addRecommendationToMeal(
                    selectedRecommendation,
                    "lunch"
                  )
                }
              />

              <MealChoiceButton
                label="Dinner"
                disabled={addingRecommendation}
                onClick={() =>
                  addRecommendationToMeal(
                    selectedRecommendation,
                    "dinner"
                  )
                }
              />

              <MealChoiceButton
                label="Snack"
                disabled={addingRecommendation}
                onClick={() =>
                  addRecommendationToMeal(
                    selectedRecommendation,
                    "snack"
                  )
                }
              />

            </div>


            {/* LOADING */}

            {addingRecommendation && (

              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#477347]">

                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D6E2D1] border-t-[#477347]" />

                Adding to your meal...

              </div>

            )}


            {/* MESSAGE */}

            {recommendationMessage &&
              !addingRecommendation && (

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#EAF2E6] px-4 py-3 text-sm text-[#35613C]">

                  <Check
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {recommendationMessage}
                  </span>

                </div>

              )}

          </div>

        </div>

      )}

    </div>
  );
}


// ============================================================
// MACRO ROW
// ============================================================

function MacroRow({
  label,
  consumed = 0,
  target = 0,
  progress = 0,
}) {

  const safeProgress = Math.min(
    Math.max(Number(progress) || 0, 0),
    100
  );

  return (
    <div>

      <div className="mb-2 flex items-center justify-between gap-4">

        <span className="min-w-[115px] text-sm font-medium text-[#27342C]">
          {label}
        </span>


        <div className="flex flex-1 items-center gap-4">

          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E7E5DC]">

            <div
              className="h-full rounded-full bg-[#5E8B55] transition-all duration-700"
              style={{
                width: `${safeProgress}%`,
              }}
            />

          </div>


          <span className="w-[82px] text-right text-xs text-[#707971]">

            {Number(consumed).toFixed(1)}
            {" / "}
            {Number(target).toFixed(1)}
            {" g"}

          </span>


          <span className="w-8 text-right text-sm font-semibold text-[#477347]">
            {Math.round(safeProgress)}%
          </span>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// MEAL CARD
// ============================================================

function MealCard({
  title,
  image,
  nutritionMeal,
  fullMeal,
}) {

  const calories =
    Number(
      nutritionMeal?.nutrition?.calories
    ) || 0;

  const itemCount =
    fullMeal?.items?.length || 0;

  const hasMeal =
    itemCount > 0 || calories > 0;

  return (
    <Link
      to="/meals"
      className="block"
    >

      <div className="group overflow-hidden rounded-[18px] border border-white/80 bg-[#FFFDF8] shadow-[0_8px_30px_rgba(40,55,40,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(40,55,40,0.12)]">


        {/* PHOTO */}

        <div className="relative h-32 overflow-hidden">

          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        </div>


        {/* DETAILS */}

        <div className="flex items-center justify-between px-5 py-4">

          <div>

            <h3 className="font-serif text-xl text-[#17271F]">
              {title}
            </h3>

            <p className="mt-0.5 text-sm text-[#777F79]">

              {hasMeal
                ? `${itemCount} ${
                    itemCount === 1
                      ? "food"
                      : "foods"
                  } · ${Math.round(calories)} kcal`
                : "No meals added yet"}

            </p>

          </div>


          <ChevronRight
            size={20}
            className="text-[#6F7A72]"
          />

        </div>

      </div>

    </Link>
  );
}


// ============================================================
// RECOMMENDATION CARD
// ============================================================

function RecommendationCard({
  food,
  onAdd,
}) {

  const nutrition =
    food.nutrition_per_100g || {};

  return (
    <article className="group overflow-hidden rounded-[20px] border border-white/80 bg-[#FFFDF8] shadow-[0_8px_30px_rgba(40,55,40,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(40,55,40,0.12)]">


      {/* TOP SECTION */}

      <div className="relative h-20 bg-[#E8F0E1]">

        <div className="absolute left-5 top-5">

          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#56825A]">
            Personalized suggestion
          </span>

        </div>


        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#35613C] shadow-sm">

          {Math.round(Number(food.score) || 0)}
          {" score"}

        </div>

      </div>


      {/* CONTENT */}

      <div className="p-5">

        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#879087]">
          {food.category}
        </p>


        <h3 className="mt-1 font-serif text-2xl text-[#17271F]">
          {food.food_name}
        </h3>


        {/* NUTRITION */}

        <div className="mt-4 grid grid-cols-4 divide-x divide-[#E1E3DB]">

          <NutritionValue
            label="kcal"
            value={nutrition.calories}
          />

          <NutritionValue
            label="g protein"
            value={nutrition.protein_g}
          />

          <NutritionValue
            label="g carbs"
            value={nutrition.carbs_g}
          />

          <NutritionValue
            label="g fiber"
            value={nutrition.fiber_g}
          />

        </div>


        {/* REASON */}

        <div className="mt-4 border-t border-[#E5E6DF] pt-4">

          <p className="text-xs leading-5 text-[#6D766F]">
            {food.reason}
          </p>

        </div>


        {/* PORTION + ACTION */}

        <div className="mt-4 flex items-end justify-between gap-3">

          <div>

            <p className="text-xs text-[#7A817B]">
              Suggested portion
            </p>

            <p className="mt-0.5 text-lg font-semibold text-[#477347]">
              {food.suggested_portion_g}g
            </p>

          </div>


          <button
            onClick={() => onAdd(food)}
            className="flex items-center gap-2 rounded-full bg-[#1F4D3A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#163A2B]"
          >

            <Plus size={15} />

            Add to meal

          </button>

        </div>

      </div>

    </article>
  );
}


// ============================================================
// NUTRITION VALUE
// ============================================================

function NutritionValue({
  label,
  value,
}) {

  return (
    <div className="px-3 first:pl-0 last:pr-0">

      <p className="text-sm font-medium text-[#26342C]">
        {Number(value || 0).toFixed(1)}
      </p>

      <p className="mt-0.5 text-[9px] text-[#89918B]">
        {label}
      </p>

    </div>
  );
}


// ============================================================
// MEAL CHOICE BUTTON
// ============================================================

function MealChoiceButton({
  label,
  onClick,
  disabled = false,
}) {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-[#DCE3D7] bg-white px-4 py-4 text-sm font-medium text-[#354239] transition hover:border-[#86A17D] hover:bg-[#F2F6ED] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}


// ============================================================
// FORMAT MEAL TYPE
// ============================================================

function formatMealType(type) {

  const labels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  };

  return labels[type] || type;
}


// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const date =
    new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default Dashboard;