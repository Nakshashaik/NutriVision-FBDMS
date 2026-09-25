# 🌿 NutriVision-FBDMS

### Food-Based Dietary Management System

NutriVision-FBDMS is a personalized nutrition management platform designed to help users understand, track, and improve their daily dietary intake.

The system allows users to maintain their nutritional profile, calculate personalized nutrition targets, record meals, monitor calories and macronutrients, analyze their dietary history, and receive personalized food recommendations based on their nutritional requirements.

---

## 🚀 Live Application

🌐 **Website:**  
https://nutri-vision-fbdms.vercel.app/

🔗 **Backend API:**  
https://nutrivision-fbdms.onrender.com/

📚 **Swagger API Documentation:**  
https://nutrivision-fbdms.onrender.com/docs

---

## 📌 Project Overview

Maintaining a balanced diet requires more than simply counting calories. Individual nutritional requirements vary depending on factors such as age, height, weight, activity level, and personal goals.

NutriVision-FBDMS addresses this problem by providing a centralized platform where users can:

- Create and manage their account
- Maintain their personal nutrition profile
- Calculate personalized daily nutrition targets
- Search for foods from a nutritional database
- Create and record meals
- Specify food quantities
- Calculate meal-level nutrition
- Track daily calorie and macronutrient consumption
- View remaining daily nutritional requirements
- Analyze historical nutrition data
- View weekly nutrition trends
- Receive personalized food recommendations

---

# ✨ Key Features

## 🔐 User Authentication

The system provides secure user authentication using:

- User registration
- User login
- Password hashing
- JWT-based authentication
- Protected API endpoints
- Token-based frontend authentication

---

## 👤 User Profile

Users can provide information required for personalized nutrition calculations, including:

- Age
- Height
- Weight
- Activity level
- Dietary goal
- Dietary preferences

The profile information is used by the nutrition engine to calculate personalized nutritional requirements.

---

## 🎯 Personalized Nutrition Targets

NutriVision-FBDMS calculates daily nutritional targets based on the user's profile.

The nutrition engine calculates:

- Daily calorie requirement
- Protein requirement
- Carbohydrate requirement
- Fat requirement
- Fiber requirement

The system uses the **Mifflin-St Jeor equation** as the basis for estimating basal metabolic requirements and applies activity-level adjustments to estimate daily energy requirements.

The system also adjusts calorie targets according to the user's selected goal:

- Weight loss
- Weight maintenance
- Weight gain

---

# 🍎 Food Database

The system maintains a nutritional food database containing information such as:

- Food name
- Calories
- Protein
- Carbohydrates
- Fat
- Fiber

The current database is populated using food composition data from **USDA FoodData Central Foundation Foods**.

Food records are stored in PostgreSQL and can be searched through the application.

---

# 🍽️ Meal Management

Users can create meals and add multiple food items to each meal.

For every food item, the user can specify the consumed quantity.

The system calculates the corresponding nutritional values based on the quantity consumed.

Supported meal operations include:

- Create meal
- Add food to meal
- Update food quantity
- Remove food from meal
- Delete meal
- View meals

---

# 📊 Daily Nutrition Tracking

The dashboard provides an overview of the user's nutritional intake for the current day.

It displays:

- Calories consumed
- Calories remaining
- Protein consumed
- Carbohydrates consumed
- Fat consumed
- Fiber consumed
- Progress toward daily targets

The dashboard also provides a visual representation of nutritional progress.

---

# 📈 Nutrition Analytics

The analytics section allows users to examine their dietary patterns over time.

The system provides:

- Daily nutrition history
- Weekly nutrition summaries
- Calorie trends
- Macronutrient trends
- Target vs consumed values

This helps users understand their overall dietary patterns instead of focusing only on a single meal.

---

# 🥗 Personalized Food Recommendations

NutriVision-FBDMS contains a recommendation engine that analyzes the user's current nutritional intake and identifies foods that may help address nutritional gaps.

The recommendation engine considers factors including:

- Nutritional requirements
- Current consumption
- Remaining nutritional targets
- Dietary compatibility
- Food nutritional composition
- Calorie requirements
- Food quality
- Suggested serving size

Recommendations include explanations describing why a particular food may be useful.

Users can directly add recommended foods to their meals.

---

# 🧠 Recommendation Engine

The recommendation system follows a rule-based nutritional scoring approach.

The process includes:

```text
User Profile
     ↓
Daily Nutrition Targets
     ↓
Current Food Consumption
     ↓
Identify Nutritional Gaps
     ↓
Filter Compatible Foods
     ↓
Calculate Food Score
     ↓
Apply Nutritional & Calorie Constraints
     ↓
Generate Recommendations
     ↓
Display Suggested Foods
