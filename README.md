# TalentVerify AI

A real-time, AI-driven internship platform connecting elite talent with top-tier companies. Built with React and Vite, TalentVerify leverages live matching, progressive readiness scoring, and dynamic talent pools to streamline the hiring process.

## 🌟 Key Features

### 🎓 For Students
- **Smart Dashboard**: View your AI Readiness Score across multiple dimensions (Technical, Problem Solving, Domain Knowledge, etc.).
- **Real-Time Matches**: Get instantly notified when a new internship matches your readiness score.
- **GitHub Verification**: Connect your GitHub to verify coding skills and boost your match confidence score.
- **Live Application Tracking**: Monitor your application status (Pending, Shortlisted, Interview, Offered, Rejected) in real-time.

### 🏢 For Companies
- **Dynamic Talent Pool**: Students are automatically pushed to your eligible pool the moment their readiness score surges past your active listings' minimum thresholds.
- **Live Event Stream**: Watch applications and status updates flow into your dashboard live via WebSockets (simulated in this prototype).
- **Intelligent Filtering**: Applications include `Match Score`, `Skill Overlap`, and `AI Confidence` to instantly highlight top candidates.

## 🚀 Quick Start

This project was bootstrapped with [Vite](https://vitejs.dev/). 

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/talent-verify-platform.git
   cd talent-verify-platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To run the platform locally in development mode:
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

## 💡 Demo Flow
The platform includes built-in mock accounts to test the real-time interaction.
1. Open *two* browser windows simultaneously.
2. In Window 1, select **Quick Demo -> Student** and sign in. 
3. In Window 2, select **Quick Demo -> Company** and sign in.
4. **Action**: In the Student window, complete an assessment to boost your readiness score. Watch as you instantly appear in the Company's `Eligible Students` dashboard.
5. **Action**: Apply to an internship as the student. Watch the application instantly stream into the Company's `Live Event` and `Recent Applications` feed.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite
- **Styling**: Context-aware custom CSS styling with a Glassmorphism aesthetic and a built-in hybrid light/dark mode.
- **Icons/Fonts**: Lucide React, JetBrains Mono, Cabinet Grotesk, DM Sans.

## 📈 Next Steps (Production)
- Hook up real WebSockets (`Socket.IO`) or Server-Sent Events to replace the simulated pub/sub.
- Migrate the `DB` mock state into a persistent backend (e.g., MongoDB / PostgreSQL).
- Implement official GitHub OAuth flow instead of username mocks.

---
*Built as a prototype for seamless real-time student-company interactions.*
