import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BrandMark from "../components/BrandMark";
import authBackground from "../assets/fbdms-auth-bg.png";

function ProfileSetup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    goal: "",
    diet_type: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/api/profile", {
        age: Number(formData.age),
        height_cm: Number(formData.height_cm),
        weight_kg: Number(formData.weight_kg),
        activity_level: formData.activity_level,
        goal: formData.goal,
        diet_type: formData.diet_type,
      });

      navigate("/dashboard");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "We couldn't save your profile. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#F8F5EE]"
      style={{
        backgroundImage: `url(${authBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 bg-[#0E2D20]/50" />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0E2D20]/55 via-[#0E2D20]/15 to-transparent" />


      <div className="relative z-10 min-h-screen">


        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="absolute left-8 top-8 sm:left-12 sm:top-10">

          <BrandMark light />

        </div>


        {/* =====================================================
            LEFT CONTENT
        ====================================================== */}

        <section className="flex min-h-screen items-center px-8 pb-12 pt-28 sm:px-12 lg:w-[42%] lg:px-16 xl:px-20">

          <div className="max-w-lg">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#D8E9D5]">
              Let's personalize your experience
            </p>

            <h1 className="text-5xl font-semibold leading-[1.06] tracking-tight text-white xl:text-6xl">
              Your nutrition.
              <br />
              Your goals.
              <br />
              Your way.
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              Tell us a little about yourself so FBDMS can
              calculate nutrition targets that are tailored
              to you.
            </p>


            {/* Progress */}

            <div className="mt-10 flex items-center gap-3">

              <div className="h-2 w-12 rounded-full bg-white" />

              <div className="h-2 w-12 rounded-full bg-white/30" />

              <div className="h-2 w-12 rounded-full bg-white/30" />

              <div className="h-2 w-12 rounded-full bg-white/30" />

            </div>

            <p className="mt-3 text-xs text-white/60">
              Profile setup • Step 1 of 4
            </p>


            {/* Small note */}

            <div className="mt-12 flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10">
                🌿
              </div>

              <p className="max-w-sm text-xs leading-5 text-white/60">
                Your information helps us personalize your
                nutrition targets and food recommendations.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            PROFILE CARD
        ====================================================== */}

        <section className="absolute right-[4%] top-1/2 w-[min(640px,52vw)] -translate-y-1/2">

          <div className="rounded-[26px] bg-[#FCFAF4]/96 px-8 py-7 shadow-[0_25px_70px_rgba(20,50,35,0.22)] backdrop-blur-md sm:px-10">


            {/* =================================================
                CARD HEADER
            ================================================== */}

            <div className="mb-6">

              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8F5B]">
                About you
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#243029]">
                Let's get to know you
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#6C786F]">
                We'll use this information to calculate your
                personalized nutrition targets.
              </p>

            </div>


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                {error}
              </div>

            )}


            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >


              {/* AGE / HEIGHT / WEIGHT */}

              <div className="grid grid-cols-3 gap-3">

                <div>

                  <label
                    htmlFor="age"
                    className="mb-1.5 block text-xs font-semibold text-[#243029]"
                  >
                    Age
                  </label>

                  <div className="relative">

                    <input
                      id="age"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="19"
                      min="13"
                      max="120"
                      required
                      className="w-full rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 pr-12 text-sm text-[#243029] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8A948D]">
                      yrs
                    </span>

                  </div>

                </div>


                <div>

                  <label
                    htmlFor="height_cm"
                    className="mb-1.5 block text-xs font-semibold text-[#243029]"
                  >
                    Height
                  </label>

                  <div className="relative">

                    <input
                      id="height_cm"
                      type="number"
                      name="height_cm"
                      value={formData.height_cm}
                      onChange={handleChange}
                      placeholder="165"
                      min="50"
                      max="250"
                      step="0.1"
                      required
                      className="w-full rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 pr-12 text-sm text-[#243029] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8A948D]">
                      cm
                    </span>

                  </div>

                </div>


                <div>

                  <label
                    htmlFor="weight_kg"
                    className="mb-1.5 block text-xs font-semibold text-[#243029]"
                  >
                    Weight
                  </label>

                  <div className="relative">

                    <input
                      id="weight_kg"
                      type="number"
                      name="weight_kg"
                      value={formData.weight_kg}
                      onChange={handleChange}
                      placeholder="55"
                      min="20"
                      max="300"
                      step="0.1"
                      required
                      className="w-full rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 pr-12 text-sm text-[#243029] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8A948D]">
                      kg
                    </span>

                  </div>

                </div>

              </div>


              {/* ACTIVITY */}

              <div>

                <label
                  htmlFor="activity_level"
                  className="mb-1.5 block text-xs font-semibold text-[#243029]"
                >
                  Activity level
                </label>

                <select
                  id="activity_level"
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 text-sm text-[#243029] outline-none transition focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                >

                  <option value="">
                    Select your activity level
                  </option>

                  <option value="sedentary">
                    Sedentary • Little or no exercise
                  </option>

                  <option value="light">
                    Lightly active • 1–3 days/week
                  </option>

                  <option value="moderate">
                    Moderately active • 3–5 days/week
                  </option>

                  <option value="active">
                    Active • 6–7 days/week
                  </option>

                  <option value="very_active">
                    Very active • Intense daily activity
                  </option>

                </select>

              </div>


              {/* GOAL + DIET */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label
                    htmlFor="goal"
                    className="mb-1.5 block text-xs font-semibold text-[#243029]"
                  >
                    Your goal
                  </label>

                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 text-sm text-[#243029] outline-none transition focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                  >

                    <option value="">
                      Choose your goal
                    </option>

                    <option value="lose">
                      Lose weight
                    </option>

                    <option value="maintain">
                      Maintain weight
                    </option>

                    <option value="gain">
                      Gain weight
                    </option>

                  </select>

                </div>


                <div>

                  <label
                    htmlFor="diet_type"
                    className="mb-1.5 block text-xs font-semibold text-[#243029]"
                  >
                    Diet preference
                  </label>

                  <select
                    id="diet_type"
                    name="diet_type"
                    value={formData.diet_type}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 text-sm text-[#243029] outline-none transition focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                  >

                    <option value="">
                      Choose your diet
                    </option>

                    <option value="vegetarian">
                      Vegetarian
                    </option>

                    <option value="non_vegetarian">
                      Non-vegetarian
                    </option>

                    <option value="vegan">
                      Vegan
                    </option>

                    <option value="eggetarian">
                      Eggetarian
                    </option>

                  </select>

                </div>

              </div>


              {/* =================================================
                  SUBMIT
              ================================================== */}

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#1F4D3A] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163A2B] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span>
                  {loading
                    ? "Creating your nutrition plan..."
                    : "Continue"}
                </span>

                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}

              </button>


              <p className="text-center text-[10px] leading-4 text-[#8A948D]">
                Your nutrition targets will be calculated automatically
                based on the information you provide.
              </p>

            </form>

          </div>

        </section>

      </div>

    </main>
  );
}

export default ProfileSetup;