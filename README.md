# 🌳 Treely – Grow Your Productivity

<p align="center">
  <a href="https://treelyx.netlify.app/"><img src="https://img.shields.io/badge/🌐_Live_Website-treelyx.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Website"></a>
  <a href="#-live-website--app-download"><img src="https://img.shields.io/badge/📱_Download_App-Android_APK-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Download Android App"></a>
</p>

[![Live Demo](https://img.shields.io/badge/Demo-treelyx.netlify.app-00C7B7?logo=netlify&logoColor=white)](https://treelyx.netlify.app/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![JavaScript](https://img.shields.io/badge/ES6%2B-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20RTDB-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

> **Turn your daily to-dos into a blooming virtual forest.**  
> Treely is a gamified productivity and habit-tracking web application designed to defeat procrastination. As you complete daily tasks and log hydration, you earn XP to nurture and evolve procedural virtual trees on an interactive canvas.

---

## 📖 Table of Contents

- [Live Website & App Download](#-live-website--app-download)
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Run](#installation--local-run)
  - [Building for Android (Capacitor)](#building-for-android-capacitor)
- [Deployment](#-deployment)
  - [Deploying to Netlify](#deploying-to-netlify)
  - [Alternative Deployments](#alternative-deployments)
- [Usage Guide](#-usage-guide)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Live Website & App Download

| Platform | Access / Download Link | Description & Instructions |
|---|---|---|
| **🌐 Live Web App** | [**treelyx.netlify.app**](https://treelyx.netlify.app/) | Access instantly in any modern desktop or mobile browser. |
| **🤖 Android App (APK)** | [**Download Android APK (`app-debug.apk`)**](android/app/build/outputs/apk/debug/app-debug.apk) | Direct APK download. Sideload and install natively on any Android device. |
| **📲 Install as PWA** | [**Open `treelyx.netlify.app`**](https://treelyx.netlify.app/) | **Chrome / Edge / Safari:** Open the link, tap browser options (⋮ or Share) and select **"Add to Home screen"** or **"Install Treely"** for an app-like fullscreen experience with offline support. |

---

## 🌟 Overview

Modern task managers often feel like rigid chore lists. **Treely** transforms productivity into an engaging, visual game:

- **The Problem:** Maintaining daily discipline, finishing tasks on time, and staying hydrated can feel tedious, leading to broken habits and procrastination.
- **The Solution:** Treely connects your real-world progress to the life cycle of a virtual tree. Every task checked off, streak sustained, and glass of water logged awards XP that directly grows and evolves your tree across weekly milestones. At the end of each cycle, your mature tree joins your permanent **Tree Collection**.

---

## ✨ Key Features

### 1. 🌲 Gamified Tree Growth Engine
- **Procedural Canvas Rendering:** Watch your tree sprout from a seed to sapling, young tree, and flourishing adult via dynamic HTML5 Canvas graphics.
- **Tree Species & Stages:** Grow various tree archetypes (Oak, Pine, Palm, Sakura) tied to your weekly XP targets.
- **Permanent Arboretum:** Completed weekly trees are archived into your personal forest showcase with historical XP and task stats.

### 2. 📋 Intelligent Task & Habit Management
- **Flexible Scheduling:** Organize tasks by **Today**, **Weekly Habits**, and **Categories** (Work, Study, Fitness, Personal).
- **Streak Tracker & XP Multipliers:** Build daily momentum with consecutive streak counters and celebration confetti.
- **Instant Actions:** Quick task creation, priority filters, and one-tap completion with undo capability via snackbars.

### 3. 💧 Integrated Hydration Tracker
- **Visual Circular Progress:** Animated SVG hydration gauge showing daily consumed volume vs. custom daily targets.
- **Quick-Add Actions:** Convenient buttons (+100ml, +200ml, +500ml) with an interactive tap-to-drink ripple effect.
- **Hydration Streaks & Insights:** Track consecutive hydration goals met, average daily intake, and historic water intake trends.

### 4. 📊 Analytics, Charts & Productivity Calendar
- **Activity Heatmap:** GitHub-style visual productivity calendar showing your consistency over months.
- **7-Day Trend Charts:** Interactive Canvas charts breaking down tasks completed and XP earned day by day.
- **Category Distribution:** Visual insights revealing where you dedicate most of your daily energy.

### 5. 📱 Cross-Platform: PWA & Android Ready
- **Installable PWA:** Works offline with Service Worker caching (`sw.js`) and modern mobile app manifest (`manifest.json`).
- **Android APK Build:** Pre-configured with **Capacitor 8** to build and run natively on Android devices.
- **Cloud Synchronization:** Built-in Firebase Authentication (Google OAuth + Email/Password) and Realtime Database persistence across devices.

---

## 🛠 Tech Stack

| Domain | Technology / Library | Description |
|---|---|---|
| **Frontend Core** | HTML5, CSS3, JavaScript (ES6 Modules) | Clean, vanilla web stack without heavy framework overhead |
| **Styling & UI** | CSS Custom Properties, Glassmorphism | Dark/Light theme switching, fluid mobile-first layouts |
| **Graphics** | HTML5 2D Canvas API | Dynamic rendering of growing trees and analytical charts |
| **Backend & Auth** | Google Firebase v10.9 (Auth + RTDB) | Cloud sync, email/password & Google popup sign-in |
| **Mobile & PWA** | Web App Manifest & Service Worker | Installable on iOS/Android browsers with offline support |
| **Native Packaging** | Capacitor (`@capacitor/android` v8) | Compiles the web app into a native Android APK |
| **Hosting** | Netlify / Vercel / GitHub Pages | Static hosting with zero configuration required |

---

## 📁 Project Structure

```text
treely/
├── android/               # Capacitor Android project files (Gradle, Java, Assets)
├── capacitor.config.json  # Capacitor mobile configuration
├── manifest.json          # Web App Manifest for PWA installation
├── sw.js                  # Service Worker for offline asset caching
├── index.html             # Main single-page application shell
├── style.css              # Core design system, variables, and animations
├── app.js                 # Application business logic, state, and Firebase integration
├── debug.html             # Developer feature preview and testing sandbox
├── logo.png               # App icon & branding assets
├── package.json           # Node.js project manifest & Capacitor dependencies
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [Git](https://git-scm.com/)
- Any static web server (e.g., VS Code Live Server, `npx serve`, or Python's `http.server`)

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/treely.git
   cd treely
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run locally using any static web server:**

   *Option A: Using `npx serve`*
   ```bash
   npx serve .
   ```

   *Option B: Using Python*
   ```bash
   # Python 3
   python -m http.server 8080
   ```

   *Option C: VS Code*
   - Open the project in VS Code.
   - Right-click `index.html` and click **"Open with Live Server"**.

4. **Open your browser:**
   Navigate to `http://localhost:3000` (or `http://localhost:8080`).

---

### 📱 Building for Android (Capacitor)

Treely is pre-configured to bundle into an Android application using Capacitor.

1. **Ensure Android Studio and Android SDK are installed.**
2. **Sync web assets to the Android platform:**
   ```bash
   npx cap sync
   ```
3. **Open the project in Android Studio:**
   ```bash
   npx cap open android
   ```
4. **Build and Run:**
   Connect your Android device or start an emulator, then click **Run** inside Android Studio to install the APK.

---

## 🌐 Deployment

### Deploying to Netlify

The production application is deployed and hosted live on Netlify at:  
👉 **[https://treelyx.netlify.app/](https://treelyx.netlify.app/)**

Treely is a static web application that requires zero build steps for web hosting.

#### Method 1: Netlify Git Integration (Recommended)
1. Push your repository to **GitHub / GitLab**.
2. Log in to [Netlify](https://www.netlify.com/) and click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Configure site settings:
   - **Build Command:** *(Leave blank)*
   - **Publish Directory:** `.` (root directory)
5. Click **"Deploy Site"**. Your application will be live in seconds!

#### Method 2: Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod --dir=.
```

### Alternative Deployments
- **GitHub Pages:** Go to repository **Settings > Pages**, select the `main` branch root `/`, and click **Save**.
- **Vercel:** Run `npx vercel` in the project root and accept default static settings.

---

## 🎮 Usage Guide

1. **Create an Account / Sign In:**
   - Launch Treely and sign in with Google or create an account with email and password.
   - Your progress automatically syncs across your devices via Firebase.

2. **Add Your Daily Tasks:**
   - Tap the central **`+`** button in the bottom navigation.
   - Enter a title, select a category (e.g., Work, Study, Health), and choose between a daily or recurring task.

3. **Track Your Hydration:**
   - On the **Home** tab, tap `+100ml`, `+200ml`, or `+500ml` as you drink water throughout the day.
   - Customize your daily goal using the ⚙️ settings button on the hydration widget.

4. **Watch Your Tree Grow:**
   - As you check off tasks, notice the growth percentage increase.
   - Navigate to the **Tree** tab to inspect full-canvas growth stages and weekly milestones.

5. **Review Analytics & History:**
   - Tap **Stats** to view your completion rate, day streak, productivity heatmap, and 7-day activity charts.
   - Tap **History** to stroll through your past weekly trees in the Tree Collection.

---

## ⚙️ Configuration

Treely is connected to Firebase for authentication and real-time database synchronization. To connect your own Firebase project:

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google Provider and Email/Password).
3. Enable **Realtime Database**.
4. Replace the `firebaseConfig` object in [`app.js`](file:///d:/antigraviy/treely/app.js) with your project's credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 🤝 Contributing

Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **ISC License**. See [`package.json`](file:///d:/antigraviy/treely/package.json) for more information.

---

<p align="center">
  Built with ❤️ for focused minds and thriving routines. 🌱
</p>
