import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Flame,
  LogOut,
  TrendingUp,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Target,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import api from "../services/api";


// ============================================================
// ANALYTICS PAGE
// ============================================================

function Analytics() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [todayTargets, setTodayTargets] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [days, setDays] = useState(7);


  // ============================================================
  // FETCH ANALYTICS DATA
  // ============================================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        historyResponse,
        weeklyResponse,
        todayResponse,
      ] = await Promise.all([
        api.get(`/api/nutrition/history?days=${days}`),
        api.get("/api/nutrition/weekly"),
        api.get("/api/nutrition/today"),
      ]);

      setHistory(
        historyResponse.data?.history ||
        historyResponse.data ||
        []
      );

      setWeekly(
        weeklyResponse.data || null
      );

      setTodayTargets(
        todayResponse.data?.targets || null
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
        "Unable to load your nutrition analytics."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchAnalytics();
  }, [days]);


  // ============================================================
  // PREPARE HISTORY DATA
  // ============================================================

  const chartData = useMemo(() => {
    return history
      .map((day) => ({
        date: formatShortDate(
          day.date || day.day
        ),

        calories: Number(
          day.calories?.consumed ??
          day.consumed?.calories ??
          0
        ),

        protein: Number(
          day.protein_g ??
          day.consumed?.protein_g ??
          day.protein ??
          0
        ),

        carbs: Number(
          day.carbs_g ??
          day.consumed?.carbs_g ??
          day.carbs ??
          0
        ),

        fat: Number(
          day.fat_g ??
          day.consumed?.fat_g ??
          day.fat ??
          0
        ),

        fiber: Number(
          day.fiber_g ??
          day.consumed?.fiber_g ??
          day.fiber ??
          0
        ),

        mealCount: Number(
          day.meal_count || 0
        ),
      }))
      .reverse();
  }, [history]);


  // ============================================================
  // WEEKLY AVERAGES
  // ============================================================

  const dailyAverages =
    weekly?.daily_averages || {};

  const averageCalories = Number(
    dailyAverages.calories || 0
  );

  const averageProtein = Number(
    dailyAverages.protein_g || 0
  );

  const averageCarbs = Number(
    dailyAverages.carbs_g || 0
  );

  const averageFat = Number(
    dailyAverages.fat_g || 0
  );

  const averageFiber = Number(
    dailyAverages.fiber_g || 0
  );


  // ============================================================
  // ACTUAL USER TARGETS
  // ============================================================

  const calorieTarget = Number(
    todayTargets?.calories || 0
  );

  const proteinTarget = Number(
    todayTargets?.protein_g || 0
  );

  const carbsTarget = Number(
    todayTargets?.carbs_g || 0
  );

  const fatTarget = Number(
    todayTargets?.fat_g || 0
  );

  const fiberTarget = Number(
    todayTargets?.fiber_g || 0
  );


  // ============================================================
  // TARGET PROGRESS
  // ============================================================

  const calorieProgress = getPercentage(
    averageCalories,
    calorieTarget
  );

  const proteinProgress = getPercentage(
    averageProtein,
    proteinTarget
  );

  const carbsProgress = getPercentage(
    averageCarbs,
    carbsTarget
  );

  const fatProgress = getPercentage(
    averageFat,
    fatTarget
  );

  const fiberProgress = getPercentage(
    averageFiber,
    fiberTarget
  );


  // ============================================================
  // TRACKING INFORMATION
  // ============================================================

  const trackedDays = Number(
    weekly?.tracking?.tracked_days ??
    chartData.filter(
      (day) => day.calories > 0
    ).length
  );

  const totalDays = Number(
    weekly?.tracking?.total_days || 7
  );


  // ============================================================
  // HIGHEST / LOWEST DAYS
  // ============================================================

  const highestDay = weekly?.highest_calorie_day
    ? {
        date: formatShortDate(
          weekly.highest_calorie_day.date
        ),

        calories: Number(
          weekly.highest_calorie_day.calories || 0
        ),
      }
    : null;


  const lowestDay = weekly?.lowest_calorie_day
    ? {
        date: formatShortDate(
          weekly.lowest_calorie_day.date
        ),

        calories: Number(
          weekly.lowest_calorie_day.calories || 0
        ),
      }
    : null;


  // ============================================================
  // AVERAGE CALORIE DIFFERENCE
  // ============================================================

  const averageDifference =
    calorieTarget > 0
      ? averageCalories - calorieTarget
      : 0;


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F2E8]">

        <div className="text-center">

          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#DDE7D7] border-t-[#1F4D3A]" />

          <p className="text-sm text-[#68736C]">
            Preparing your nutrition analytics...
          </p>

        </div>

      </div>
    );
  }


  // ============================================================
  // ERROR STATE
  // ============================================================

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
            onClick={fetchAnalytics}
            className="mt-6 rounded-xl bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#163A2B]"
          >
            Try again
          </button>

        </div>

      </div>
    );
  }


  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6F2E8]">

      {/* ======================================================
          NAVIGATION
      ======================================================= */}

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between rounded-[22px] border border-white/70 bg-[#FFFDF8]/95 px-5 py-3 shadow-[0_8px_30px_rgba(40,60,45,0.08)] backdrop-blur-xl sm:px-7">

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


          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/dashboard"
              className="py-2 text-sm text-[#747D77] transition hover:text-[#173F2D]"
            >
              Dashboard
            </Link>


            <Link
              to="/meals"
              className="py-2 text-sm text-[#747D77] transition hover:text-[#173F2D]"
            >
              Meals
            </Link>


            <Link
              to="/analytics"
              className="relative flex items-center gap-2 py-2 text-sm font-semibold text-[#173F2D]"
            >

              <TrendingUp size={15} />

              Analytics

              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#3E7047]" />

            </Link>


            <Link
              to="/profile-setup"
              className="py-2 text-sm text-[#747D77] transition hover:text-[#173F2D]"
            >
              Profile
            </Link>

          </nav>


          {/* LOGOUT */}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="rounded-lg p-2 text-[#667169] transition hover:text-red-600"
          >
            <LogOut size={19} />
          </button>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="mx-auto max-w-[1450px] px-5 pb-16 pt-8 sm:px-7 lg:px-10">


        {/* ====================================================
            HEADER
        ===================================================== */}

        <section className="mb-8">

          <Link
            to="/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm text-[#68736C] transition hover:text-[#173F2D]"
          >

            <ArrowLeft size={16} />

            Back to dashboard

          </Link>


          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#56825A]">
                Nutrition insights
              </p>

              <h1 className="font-serif text-4xl tracking-tight text-[#13251C] sm:text-5xl">
                Your analytics
              </h1>

              <p className="mt-2 text-base text-[#737B75]">
                Understand your eating patterns and nutrition progress.
              </p>

            </div>


            {/* PERIOD SELECTOR */}

            <div className="relative">

              <select
                value={days}
                onChange={(e) =>
                  setDays(Number(e.target.value))
                }
                className="appearance-none rounded-xl border border-[#E0E3D9] bg-[#FFFDF8] py-3 pl-4 pr-10 text-sm text-[#59635C] shadow-sm outline-none focus:border-[#6D9365]"
              >

                <option value={7}>
                  Last 7 days
                </option>

                <option value={14}>
                  Last 14 days
                </option>

                <option value={30}>
                  Last 30 days
                </option>

              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#747D77]"
              />

            </div>

          </div>

        </section>


        {/* ====================================================
            SUMMARY CARDS
        ===================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <SummaryCard
            icon={Flame}
            label="Avg. calories"
            value={averageCalories}
            unit="kcal"
          />

          <SummaryCard
            icon={Beef}
            label="Avg. protein"
            value={averageProtein}
            unit="g"
          />

          <SummaryCard
            icon={Wheat}
            label="Avg. carbs"
            value={averageCarbs}
            unit="g"
          />

          <SummaryCard
            icon={Droplets}
            label="Avg. fat"
            value={averageFat}
            unit="g"
          />

          <SummaryCard
            icon={Leaf}
            label="Avg. fiber"
            value={averageFiber}
            unit="g"
          />

        </section>


        {/* ====================================================
            TARGET COMPARISON
        ===================================================== */}

        <section className="mt-6 rounded-[22px] border border-white/80 bg-[#FFFDF8] p-6 shadow-[0_10px_35px_rgba(40,55,40,0.07)] sm:p-8">

          <div className="mb-7">

            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#56825A]">
              Target comparison
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#17271F]">
              How your average intake compares
            </h2>

            <p className="mt-1 text-sm text-[#7A817B]">
              Your averages compared with your daily nutrition targets.
            </p>

          </div>


          <div className="grid gap-6 lg:grid-cols-2">

            <ProgressMetric
              icon={Flame}
              label="Calories"
              value={averageCalories}
              target={calorieTarget}
              unit="kcal"
              percentage={calorieProgress}
            />


            <ProgressMetric
              icon={Beef}
              label="Protein"
              value={averageProtein}
              target={proteinTarget}
              unit="g"
              percentage={proteinProgress}
            />


            <ProgressMetric
              icon={Wheat}
              label="Carbohydrates"
              value={averageCarbs}
              target={carbsTarget}
              unit="g"
              percentage={carbsProgress}
            />


            <ProgressMetric
              icon={Droplets}
              label="Fat"
              value={averageFat}
              target={fatTarget}
              unit="g"
              percentage={fatProgress}
            />


            <ProgressMetric
              icon={Leaf}
              label="Fiber"
              value={averageFiber}
              target={fiberTarget}
              unit="g"
              percentage={fiberProgress}
            />

          </div>

        </section>


        {/* ====================================================
            TRACKING OVERVIEW
        ===================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InsightCard
            icon={Activity}
            label="Tracking days"
            value={trackedDays}
            suffix={`of ${totalDays}`}
            description="Days with recorded nutrition"
          />


          <InsightCard
            icon={Target}
            label="Average target gap"
            value={Math.abs(Math.round(averageDifference))}
            suffix="kcal"
            description={
              averageDifference > 0
                ? "Above your calorie target"
                : averageDifference < 0
                ? "Below your calorie target"
                : "At your calorie target"
            }
          />


          <InsightCard
            icon={TrendingUp}
            label="Highest intake"
            value={
              highestDay
                ? Math.round(highestDay.calories)
                : 0
            }
            suffix="kcal"
            description={
              highestDay
                ? highestDay.date
                : "No recorded day"
            }
          />


          <InsightCard
            icon={CalendarDays}
            label="Lowest intake"
            value={
              lowestDay
                ? Math.round(lowestDay.calories)
                : 0
            }
            suffix="kcal"
            description={
              lowestDay
                ? lowestDay.date
                : "No recorded day"
            }
          />

        </section>


        {/* ====================================================
            CALORIE TREND
        ===================================================== */}

        <section className="mt-6 rounded-[22px] border border-white/80 bg-[#FFFDF8] p-6 shadow-[0_10px_35px_rgba(40,55,40,0.07)] sm:p-8">

          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

            <div>

              <h2 className="font-serif text-2xl text-[#17271F]">
                Calorie trend
              </h2>

              <p className="mt-1 text-sm text-[#7A817B]">
                Your daily calorie intake over time.
              </p>

            </div>


            <div className="flex items-center gap-2 text-xs text-[#7B847D]">

              <CalendarDays size={14} />

              {days} day view

            </div>

          </div>


          <div className="h-[320px] w-full">

            {chartData.length === 0 ? (

              <EmptyChart />

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    stroke="#E7E9E2"
                    strokeDasharray="4 4"
                  />


                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#7A817B",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />


                  <YAxis
                    tick={{
                      fill: "#7A817B",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />


                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF8",
                      border: "1px solid #E1E4DC",
                      borderRadius: "12px",
                      boxShadow:
                        "0 8px 25px rgba(40,55,40,0.10)",
                    }}
                    formatter={(value) => [
                      `${Math.round(Number(value) || 0)} kcal`,
                      "Calories",
                    ]}
                  />


                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#477347"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#477347",
                      strokeWidth: 2,
                      stroke: "#FFFDF8",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </section>


        {/* ====================================================
            MACRO TRENDS
        ===================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          <MacroChart
            title="Protein & carbohydrates"
            description="Daily protein and carbohydrate intake."
            data={chartData}
            bars={[
              {
                key: "protein",
                name: "Protein",
                fill: "#477347",
              },
              {
                key: "carbs",
                name: "Carbs",
                fill: "#8BA875",
              },
            ]}
          />


          <MacroChart
            title="Fat & fiber"
            description="Daily fat and fiber intake."
            data={chartData}
            bars={[
              {
                key: "fat",
                name: "Fat",
                fill: "#6D8D63",
              },
              {
                key: "fiber",
                name: "Fiber",
                fill: "#A4B98F",
              },
            ]}
          />

        </section>


        {/* ====================================================
            DAILY HISTORY
        ===================================================== */}

        <section className="mt-6 rounded-[22px] border border-white/80 bg-[#FFFDF8] shadow-[0_10px_35px_rgba(40,55,40,0.07)]">

          <div className="border-b border-[#E7E8E1] px-6 py-6 sm:px-8">

            <h2 className="font-serif text-2xl text-[#17271F]">
              Daily nutrition history
            </h2>

            <p className="mt-1 text-sm text-[#7A817B]">
              A detailed view of your recent nutrition intake.
            </p>

          </div>


          <div className="overflow-x-auto">

            {chartData.length === 0 ? (

              <div className="p-10">
                <EmptyChart />
              </div>

            ) : (

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="border-b border-[#E7E8E1] text-left">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#89918B] sm:px-8">
                      Date
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#89918B]">
                      Calories
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#89918B]">
                      Protein
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#89918B]">
                      Carbs
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#89918B]">
                      Fat
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#89918B]">
                      Fiber
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {chartData.map((day, index) => (

                    <tr
                      key={`${day.date}-${index}`}
                      className="border-b border-[#EFF0EB] last:border-b-0 hover:bg-[#FAFBF7]"
                    >

                      <td className="px-6 py-4 text-sm font-medium text-[#27342C] sm:px-8">
                        {day.date}
                      </td>


                      <td className="px-4 py-4 text-sm text-[#536058]">
                        {Math.round(day.calories)} kcal
                      </td>


                      <td className="px-4 py-4 text-sm text-[#536058]">
                        {day.protein.toFixed(1)} g
                      </td>


                      <td className="px-4 py-4 text-sm text-[#536058]">
                        {day.carbs.toFixed(1)} g
                      </td>


                      <td className="px-4 py-4 text-sm text-[#536058]">
                        {day.fat.toFixed(1)} g
                      </td>


                      <td className="px-4 py-4 text-sm text-[#536058]">
                        {day.fiber.toFixed(1)} g
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  unit,
}) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-[#FFFDF8] p-5 shadow-[0_8px_30px_rgba(40,60,45,0.06)]">

      <div className="flex items-center gap-2">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0E1]">

          <Icon
            size={17}
            className="text-[#477347]"
          />

        </div>

        <span className="text-xs text-[#7A817B]">
          {label}
        </span>

      </div>


      <div className="mt-4">

        <span className="font-serif text-2xl text-[#17271F]">
          {Number(value || 0).toFixed(1)}
        </span>

        <span className="ml-1 text-xs text-[#89918B]">
          {unit}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// PROGRESS METRIC
// ============================================================

function ProgressMetric({
  icon: Icon,
  label,
  value,
  target,
  unit,
  percentage,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0E1]">

            <Icon
              size={15}
              className="text-[#477347]"
            />

          </div>

          <span className="text-sm font-medium text-[#39463E]">
            {label}
          </span>

        </div>


        <span className="text-xs text-[#7A817B]">
          {percentage.toFixed(0)}%
        </span>

      </div>


      <div className="h-2.5 overflow-hidden rounded-full bg-[#E8EBE3]">

        <div
          className="h-full rounded-full bg-[#5F8A5B] transition-all duration-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>


      <div className="mt-2 flex justify-between text-xs">

        <span className="text-[#536058]">
          {value.toFixed(1)} {unit}
        </span>

        <span className="text-[#89918B]">
          Target {target.toFixed(1)} {unit}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// INSIGHT CARD
// ============================================================

function InsightCard({
  icon: Icon,
  label,
  value,
  suffix,
  description,
}) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-[#FFFDF8] p-5 shadow-[0_8px_30px_rgba(40,60,45,0.06)]">

      <div className="flex items-center gap-2">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0E1]">

          <Icon
            size={16}
            className="text-[#477347]"
          />

        </div>

        <span className="text-xs text-[#7A817B]">
          {label}
        </span>

      </div>


      <div className="mt-4">

        <span className="font-serif text-2xl text-[#17271F]">
          {value}
        </span>

        <span className="ml-1 text-xs text-[#89918B]">
          {suffix}
        </span>

      </div>


      <p className="mt-1 text-xs text-[#89918B]">
        {description}
      </p>

    </div>
  );
}


// ============================================================
// MACRO CHART
// ============================================================

function MacroChart({
  title,
  description,
  data,
  bars,
}) {
  return (
    <div className="rounded-[22px] border border-white/80 bg-[#FFFDF8] p-6 shadow-[0_10px_35px_rgba(40,55,40,0.07)] sm:p-8">

      <div className="mb-7">

        <h2 className="font-serif text-2xl text-[#17271F]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[#7A817B]">
          {description}
        </p>

      </div>


      <div className="h-[300px]">

        {data.length === 0 ? (

          <EmptyChart />

        ) : (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 5,
              }}
            >

              <CartesianGrid
                stroke="#E7E9E2"
                strokeDasharray="4 4"
              />


              <XAxis
                dataKey="date"
                tick={{
                  fill: "#7A817B",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />


              <YAxis
                tick={{
                  fill: "#7A817B",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />


              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFDF8",
                  border: "1px solid #E1E4DC",
                  borderRadius: "12px",
                  boxShadow:
                    "0 8px 25px rgba(40,55,40,0.10)",
                }}
              />


              <Legend />


              {bars.map((bar) => (

                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  name={bar.name}
                  fill={bar.fill}
                  radius={[5, 5, 0, 0]}
                />

              ))}

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>
  );
}


// ============================================================
// EMPTY CHART
// ============================================================

function EmptyChart() {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center">

      <div className="text-center">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0E5]">

          <TrendingUp
            size={20}
            className="text-[#4D7A50]"
          />

        </div>


        <p className="mt-4 text-sm font-medium text-[#536058]">
          Not enough nutrition data yet
        </p>


        <p className="mt-1 text-xs text-[#89918B]">
          Add meals to start building your nutrition history.
        </p>

      </div>

    </div>
  );
}


// ============================================================
// HELPERS
// ============================================================

function getPercentage(value, target) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.min(
    (value / target) * 100,
    100
  );
}


function formatShortDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}


export default Analytics;