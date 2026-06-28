# 🌌 GitPulse — Cinematic Developer Storyteller

GitPulse is a premium, client-side web application that transforms standard GitHub profiles and repositories into interactive, animated "Developer Universe" constellations. 

Instead of flat badges or standard tables, GitPulse leverages custom HTML5 Canvas particle systems and GSAP cinematic transitions to present developer contributions, stargazers, and language telemetry as stellar orbits.

---

## ✨ Features

- **GitHub API Telemetry**: Direct, lightweight profile scanning that compiles repository details, stars, and follower mass.
- **Interactive Constellation Canvas**: A custom HTML5 particle engine that reacts to mouse positions, creating local gravity and connection webs.
- **Cinematic Story Mode**: Sliding slide sections featuring staggered GSAP load-ins, custom radial progress, and interactive star count increments.
- **Offline Log Parser**: A built-in log parser allowing developers to extract and visualize repository structures directly from local `git log` streams (bypassing GitHub API rate limits).
- **Stellar Assessment Engine**: Algorithms that calculate developer impact metrics and assign rank classifications (e.g. `Quantum Architect`, `Constellation Designer`).
- **One-Click LinkedIn Share**: Built-in template generator to easily share your constellation score.

---

## 🛠️ Technology Stack

- **Structure**: Semantic HTML5
- **Style**: Premium Custom CSS (Custom properties, Glassmorphism, Noise filters, Responsive grid systems)
- **Physics & Backgrounds**: Custom HTML5 Canvas Math (Stochastic particle movement, mouse-interactive attraction)
- **Transitions**: GSAP (GreenSock Animation Platform)

---

## 🚀 How to Run Locally

Since GitPulse is built on vanilla web standards without heavy frameworks, it runs instantly:

1. Clone or download this repository.
2. Open `index.html` directly in your browser, or serve it using a simple HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```
3. Open `http://localhost:8000` (or the served port) in your browser.

---

## 💻 Visualizing Local Repositories Offline

To run telemetry on a local repository without pushing to GitHub or hitting API rate limits:

1. Open your terminal in the root of any git repository.
2. Run the following command to output your last 100 commits in clean JSON format:
   ```powershell
   git log --pretty=format:'{^^n  \"commit\": \"%H\",^^n  \"author\": \"%an\",^^n  \"date\": \"%ad\",^^n  \"message\": \"%f\"^^n},' -n 100
   ```
3. Copy the output, click **Parse Local Git Log** on GitPulse, paste it, and watch your local code history turn into a galaxy!

---

## 🌐 Deploy to GitHub Pages

Deploying GitPulse to your own subpath (e.g. `https://<your-username>.github.io/gitpulse`) takes seconds:

1. Create a public repository named `gitpulse` on GitHub.
2. Link your local project:
   ```bash
   git remote add origin https://github.com/<your-username>/gitpulse.git
   git branch -M main
   git add .
   git commit -m "Initialize GitPulse"
   git push -u origin main
   ```
3. Go to **Settings > Pages** in your GitHub repository sidebar.
4. Under **Build and deployment**, select the source as **Deploy from a branch**, set the branch to `main` (root folder), and click **Save**.
5. Your galactic developer visualizer will be live at `https://<your-username>.github.io/gitpulse`!

---

*Designed and developed by [Rahul Agarwal](https://github.com/rahulagarwal18).*
