<div align="center">
  <img src="./assets/images/icon.png" alt="GigShield Logo" width="200" height="286">

  # GigShield 🛡️
  **The Parametric Insurance Engine for Gig Economy Workers.**
  
  [![Built with Expo](https://img.shields.io/badge/Built_with-Expo-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Powered by React Native](https://img.shields.io/badge/Powered_by-React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
</div>

<br/>

## ⛈️ The Problem
Over 8 million gig-economy workers (delivery partners, ride-share drivers) in India lose their daily wages when extreme weather strikes. Traditional insurance is slow, requires tedious paperwork, and physically does not function for low-wage daily earners. 

## 💡 The Solution
**GigShield** is a zero-friction, algorithmic parametric insurance application explicitly designed to protect the wages of daily gig workers. 
Using localized weather mapping and automated ledger contracts, GigShield completely automates the traditional insurance pipeline. 

- ❌ No form submissions
- ❌ No damage assessment waiting periods
- ❌ No confusing premium clauses

When heavy rain disrupts a specific micro-zone, the AI system **simulates the baseline disruption**, verifies the risk threshold, and autonomously processes a cash payout to the affected worker's UPI wallet *within minutes*.

---

## 🚀 Key Features

* **Live Parametric Map Overlay:** Deep Vector graphics tracking real-time high-risk and safe zones mapping.
* **Cinematic Event Handling:** App autonomously intercepts high-rainfall triggers and instantly spawns event modals displaying processing metadata.
* **Algorithmic Claim Timelines:** Claim lifecycles are generated on the spot using mathematical disruption evaluations.
* **Dark-Mode Native Framework:** Built on a deeply integrated, ultra-lightweight dark mode architecture protecting OLED screens and battery life for riders.
* **Cross-Platform:** Transpiles physically to Android `.apk`, iOS apps, and a universal Web application via Expo.

---

## 🧠 AI/ML Architecture

### 1. Premium Calculation — Logistic Regression Model
- **Features**: City risk, seasonal factors, zone flood history, exposure hours, claims history, earnings bracket
- **Mechanism**: Weights trained on longitudinal Indian weather disruption patterns and payout histories
- **Output**: Personalized dynamic weekly premium (Rs.25–Rs.120) with live confidence scoring returned directly to the user dashboard.

### 2. Fraud Detection — Multi-signal Anomaly Engine  
- **Detection Signals**: Weather corroboration API, amount vs baseline, claim frequency, account aging, hours claimed timeline, reporting anomaly deviation.
- **Mechanism**: Isolation Forest-inspired z-score outlier detection models calculating a mathematically rigorous `Fraud Score`.
- **Output**: Intelligent automated routing — `Auto-approve` (score < 25), `Flag for review` (25-60), or `Reject/Investigate` (> 60). Ensures sustainable platform liquidity.

### 3. Weather Risk — Real-time OpenWeatherMap Integration
- **Live API Telemetry**: Deep latency-free ingestion of OpenWeatherMap data coordinates with intelligent graceful `Smart Mock Fallback` for uninterrupted UX during rate limits.
- **Conditionals**: Season-aware monsoon/summer algorithms mapped to 5 distinct parametric triggers (Rain, Heat, AQI, Curfew, Outages).

---

## 🛠️ Technology Stack
- **Frontend Core:** React Native, Typescript, Expo Router 
- **Database & Auth:** Supabase (PostgreSQL), Zustand State Management
- **UI Architecture:** Custom-built Zero-Dep Design System featuring Spring Physics & `react-native-svg`
- **Deployments:** EAS Build Pipeline (Android), Netlify (Web)

## 📱 Running the Project Locally

We have natively optimized the client to run under Expo. 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/GigShield.git
   cd GigShield
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the Engine:**
   ```bash
   npx expo start
   ```

*To run physical APK simulations, use **EAS Build**.*
**Or easier way(RECOMMENDED)**
follow this link
 ```
https://expo.dev/accounts/slayerexe/projects/GigShield/builds/530d85a4-9ae6-4b49-bf89-3b333af380c0
 ```
and click install this will download the .apk and can be used like a real app.


<div align="center">
  <br/>
  <b>Built for impact. Protected by code.</b>
</div>
