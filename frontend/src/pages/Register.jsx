import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import BrandMark from "../components/BrandMark";
import authBackground from "../assets/fbdms-auth-bg.png";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
      });

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "We couldn't create your account. Please try again."
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

      {/* Background overlays */}

      <div className="absolute inset-0 bg-[#0E2D20]/45" />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0E2D20]/55 via-[#0E2D20]/10 to-transparent" />


      <div className="relative z-10 min-h-screen">


        {/* =====================================================
            TOP BRAND
        ====================================================== */}

        <div className="absolute left-8 top-8 sm:left-12 sm:top-10">

          <BrandMark light />

        </div>


        {/* =====================================================
            LEFT HERO
        ====================================================== */}

        <section className="flex min-h-screen items-center px-8 pb-10 pt-32 sm:px-12 lg:w-[58%] lg:px-16 xl:px-20">

          <div className="max-w-2xl">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#D8E9D5] sm:text-sm">
              Start your nutrition journey
            </p>

            <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-[68px]">
              Better choices.
              <br />
              One meal at a time.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              Build healthier habits by understanding your food,
              tracking your meals, and discovering choices that
              fit your everyday life.
            </p>


            {/* Benefits */}

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-5 sm:gap-8">

              <div>

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm">
                  <span className="text-lg">
                    🌿
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Personalized
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">
                  Built around your goals
                </p>

              </div>


              <div>

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm">
                  <span className="text-lg">
                    🍽️
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Simple
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">
                  Log what you actually eat
                </p>

              </div>


              <div>

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm">
                  <span className="text-lg">
                    📈
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Insights
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">
                  Understand your progress
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            WIDE + SHORT REGISTER CARD
        ====================================================== */}

        <section className="absolute right-[4%] top-1/2 w-[min(640px,44vw)] -translate-y-1/2">

          <div className="rounded-[24px] bg-[#FCFAF4]/95 px-8 py-5 shadow-[0_20px_60px_rgba(20,50,35,0.20)] backdrop-blur-md sm:px-9 sm:py-6">


            {/* =================================================
                BRAND
            ================================================== */}

            <div className="mb-5 flex items-center justify-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F0E7]">

                <span className="text-2xl">
                  🌱
                </span>

              </div>

              <div>

                <h2 className="text-xl font-bold tracking-tight text-[#174532]">
                  FBDMS
                </h2>

                <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#6C786F]">
                  Eat well. Live well.
                </p>

              </div>

            </div>


            {/* =================================================
                HEADING
            ================================================== */}

            <div className="mb-5 text-center">

              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8F5B]">
                Get started
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-[#243029]">
                Create your account
              </h1>

              <p className="mt-1 text-xs text-[#6C786F]">
                Start your personalized nutrition journey.
              </p>

            </div>


            {/* Error */}

            {error && (

              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">

                {error}

              </div>

            )}


            {/* =================================================
                REGISTER FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >

              <div>

                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold text-[#243029]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 text-sm text-[#243029] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                />

              </div>


              <div>

                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold text-[#243029]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 text-sm text-[#243029] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                />

              </div>


              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-semibold text-[#243029]"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[#D5DDD3] bg-white px-4 py-3 text-sm text-[#243029] outline-none transition placeholder:text-[#A0AAA3] focus:border-[#4F8F5B] focus:ring-4 focus:ring-[#4F8F5B]/10"
                />

              </div>


              <p className="pt-0.5 text-[10px] leading-4 text-[#8A948D]">
                Use at least 6 characters for your password.
              </p>


              {/* Create account */}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#1F4D3A] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163A2B] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span>
                  {loading
                    ? "Creating your account..."
                    : "Create account"}
                </span>

                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}

              </button>

            </form>


            {/* Divider */}

            <div className="my-4 flex items-center gap-4">

              <div className="h-px flex-1 bg-[#DDE2DA]" />

              <span className="text-[10px] text-[#9AA49C]">
                OR
              </span>

              <div className="h-px flex-1 bg-[#DDE2DA]" />

            </div>


            {/* Google */}

            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#CBD3CA] bg-white py-3 text-xs font-semibold text-[#536057] opacity-70"
            >

              <span className="font-bold">
                G
              </span>

              Continue with Google

            </button>


            {/* Sign in */}

            <p className="mt-4 text-center text-xs text-[#6C786F]">

              Already have an account?{" "}

              <Link
                to="/"
                className="font-semibold text-[#1F4D3A] hover:text-[#4F8F5B] hover:underline"
              >
                Sign in
              </Link>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Register;