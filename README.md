<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Twitch_API-9146FF?style=for-the-badge&logo=twitch&logoColor=white" alt="Twitch API" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
  <br>
  <h1>⏱️ Twitch Interactive Timer ("El Pitillo")</h1>
  <p><b>An interactive, real-time OBS countdown timer controlled by your Twitch Chat via Follows, Subs, and Bits.</b></p>
</div>

---

## 📖 What is this?
**Twitch Timer** is an open-source, highly customizable widget for OBS. It creates an on-screen countdown timer that automatically adds seconds whenever a viewer interacts with your stream (Follow, Subscribe, or donate Bits). It is completely driven by the official Twitch EventSub WebSockets API for millisecond-precision real-time updates.

This repository is split into two distinct versions to fit any streamer's or developer's needs:

### 1. 🖥️ The Standalone App (`twitch-timer-app`)
A lightweight, single-tenant Node.js app designed to be run **locally on your own PC** while you stream.
- Zero complex databases.
- Runs completely on `localhost`.
- Perfect for individual streamers who just want to `npm start` and go live.

### 2. ☁️ The Cloud SaaS Server (`twitch-timer-server`)
A production-ready, **Multi-Tenant SaaS architecture** designed to be deployed to a VPS (like Google Cloud).
- **Multi-Tenant:** Host the timer for hundreds of streamers simultaneously on a single server.
- **SQLite Database:** Persistent configurations for each user.
- **Admin Whitelist:** A hidden `/adminconf` dashboard to manually approve new streamers.
- **Custom Assets:** Each streamer gets their own isolated `uploads/` folder for custom MP3 sounds and GIF animations via their control panel.
- *(Includes full deployment guides for Google Cloud, Ubuntu, Nginx, DuckDNS, and Let's Encrypt).*

---

## ✨ Features
- **Real-Time WebSockets:** Uses `@twurple/eventsub-ws` to react instantly without polling.
- **Customizable Rules:** Streamers can set their own values (e.g., +30s per follow, +300s per sub).
- **Control Panel:** A beautiful, dark-mode web dashboard to control the timer manually, simulate events, and upload custom assets.
- **Visual & Audio Toggles:** Streamers can independently toggle CSS animations, GIFs, and MP3 sounds to fit their stream's vibe.

---

## 🚀 Quick Start (Local App)

Want to run the timer on your own PC right now?

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/twitch-timer.git
   cd twitch-timer/twitch-timer-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the app:**
   ```bash
   npm start
   ```
4. **Open your browser:** Go to `http://localhost:3000` to log in with Twitch and get your OBS URL!

---

## 📚 Documentation & Cloud Deployment

If you want to deploy the **SaaS Server** version to the cloud, we have provided an exhaustive ecosystem of documentation (currently in Spanish).

- [📖 Architecture & DB Docs](twitch-timer-server/Documentacion.md)
- [☁️ Google Cloud Free Tier Setup](twitch-timer-server/GCP_SERVER_GUIDE.md)
- [🐧 Ubuntu & PM2 Setup](twitch-timer-server/UBUNTU_SETUP_GUIDE.md)
- [🔒 DuckDNS, Nginx & HTTPS](twitch-timer-server/DNS_HTTPS_GUIDE.md)

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).
Read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📝 License
This project is [MIT](LICENSE) licensed.
