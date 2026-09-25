# NutriVision-FBDMS 🌱

### Food-Based Dietary Management System

NutriVision-FBDMS is a web-based dietary management system designed to help users monitor their daily food intake, understand their nutritional consumption, track meals, visualize nutrition trends, and receive personalized food recommendations based on their nutritional requirements.

The system combines a React-based frontend, FastAPI backend, PostgreSQL database, nutrition calculation engine, and personalized recommendation engine into a unified dietary management platform.

---

## 📌 Project Overview

Maintaining a balanced diet requires more than simply counting calories. Users need to understand their daily nutritional requirements, record what they consume, identify nutritional gaps, and make informed food choices.

NutriVision-FBDMS addresses this by providing:

- User registration and authentication
- Personalized user profiles
- Daily calorie and macronutrient targets
- Food database and food search
- Meal creation and management
- Automatic nutritional calculation
- Daily nutrition tracking
- Historical nutrition analysis
- Weekly analytics
- Personalized food recommendations

The system is designed with a modular architecture so that additional intelligent dietary features can be integrated in future versions.

---

## 🎯 Objectives

The main objectives of NutriVision-FBDMS are:

1. To provide users with personalized daily nutritional targets.
2. To maintain a structured database of food items and their nutritional values.
3. To allow users to record and manage their daily meals.
4. To automatically calculate nutritional intake based on food quantity.
5. To track calories, protein, carbohydrates, fats, and dietary fiber.
6. To identify nutritional gaps between consumed nutrients and daily targets.
7. To provide personalized food recommendations.
8. To visualize historical nutrition data through analytics.
9. To provide a scalable architecture for future AI-assisted dietary features.

---

## ✨ Key Features

### 🔐 User Authentication

Users can:

- Register an account
- Log in securely
- Access authenticated resources
- Maintain their own dietary data

Authentication is implemented using JWT-based authentication.

---

### 👤 Personalized User Profile

Users can provide:

- Age
- Height
- Weight
- Activity level
- Dietary preference
- Fitness goal

The system uses these parameters to calculate personalized nutrition targets.

#### Supported Activity Levels

- Sedentary
- Light
- Moderate
- Active
- Very Active

#### Supported Goals

- Weight Loss
- Maintenance
- Weight Gain

#### Supported Dietary Preferences

- Vegetarian
- Non-Vegetarian
- Vegan
- Eggetarian

---

## 🔥 Nutrition Target Calculation

The system calculates personalized nutritional targets using the following pipeline:

```text
User Profile
     ↓
BMR Calculation
     ↓
TDEE Calculation
     ↓
Goal Adjustment
     ↓
Daily Calorie Target
     ↓
Macronutrient Targets