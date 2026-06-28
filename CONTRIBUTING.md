# Contributing to GitPulse 🌌

Thank you for showing interest in contributing to **GitPulse**! We are committed to building a welcoming and premium open-source community for developers who want to showcase their telemetry.

---

## 🛠️ Getting Started

### 1. Prerequisites
You need a simple local web server to run the client-side files and avoid CORS issues when loading local resources. We recommend:
* **Node.js**: Install [Live Server](https://www.npmjs.com/package/live-server) (`npm install -g live-server`) or run with VS Code's "Live Server" extension.

### 2. Local Setup
1. Fork this repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gitpulse.git
   cd gitpulse
   ```
3. Launch the development server:
   ```bash
   live-server
   ```
4. Open `http://127.0.0.1:8080` in your browser.

---

## 📂 Project Structure

* `index.html`: Holds the core landing forms, loader grids, and slide-deck containers (Single deck and Duel deck).
* `style.css`: All premium styling rules, typography, glassmorphism templates, responsive flex layouts, and keyframe animations.
* `canvas.js`: Background space logic and mouse-interactive physics particle network.
* `story.js`: Controls GSAP timelines, slides transitions, counter animations, and radial progress indicators.
* `app.js`: Integrates GitHub REST API fetching, offline git log parsers, badge generators, and LinkedIn sharing scripts.

---

## 🎨 Visual Design Guidelines

To maintain the premium HUD/Glassmorphism feel:
1. **Glass Cards**: Always use a translucent background with blur filters:
   ```css
   background: rgba(255, 255, 255, 0.03);
   backdrop-filter: blur(20px);
   border: 1px solid rgba(255, 255, 255, 0.08);
   ```
2. **Typography**: Use standard custom variables (`var(--font-display)` for headers, `var(--font-main)` for body, `var(--font-mono)` for telemetry data).
3. **Colors**: Tailor values to premium dark-theme palettes. Avoid plain primaries. Use `#00ffff` (Cyan), `#8b5cf6` (Purple), `#ffbc00` (Gold), and `#ff3b30` (Neon Red).

---

## 🚀 Contribution Workflow

1. **Find an Issue**: Look at our open issues or create one to suggest a feature.
2. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes**: Follow clean formatting, keep inline comments, and test on both **laptop and mobile viewports** to check layout responsiveness.
4. **Commit**: Keep commits descriptive:
   ```bash
   git commit -m "Add custom indicator transition to duel verdict slide"
   ```
5. **Push and PR**: Push to your fork and submit a Pull Request (PR) to the `main` branch.

Happy coding! 🚀
