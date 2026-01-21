<h1 align="center">🎓 Degree Companion 🎓</h1>

Simple web app to allow students to plan their academic journey in a simplified and understandable manner.

## 🚀 Getting Started

### 💻 Prerequisites

- Git
- Bun.js (OR: npm & node)
- Rust & Cargo (rustup)

### 📦 Releases

Built pre-release artifacts (executables for supported platforms) are published on the GitHub Releases page.
Download the latest release [here](https://github.com/gugacs/degree-companion/releases/latest).
We currently have exceutables for Windows, macOS, and Linux.

### 📦 Manual Setup

```bash
# Clone the repository
git clone git@github.com:gugacs/degree-companion.git
cd degree-companion # Ensure you are in the project root

# Prepare the app
bun install # OR: npm install
```

## 🛠️ Tech Stack

- SvelteKit & TypeScript
- Rust

### ⚙️ Running

**Development Mode**

```bash
bun run tauri dev # New application window should open
```

**Production Build**

```bash
bun run tauri build # Will create executable files in src-tauri/target folder
```

## ⚠️ Limitations

Due to using tauri specific plugins (e.g., [File System](https://v2.tauri.app/plugin/file-system/), [Dialog](https://v2.tauri.app/plugin/dialog/)) it is impossible to deploy this application as a regular web app.
The core application logic would need to be restructured in order to built a version of this application deployable on web servers.
This application is supposed to help individuals plan their academic journey for which a regular desktop app is more suitable anways due to lower overhead.

## 📝 License

MIT License (see [License file](LICENSE))

---

Made with ❤️ by [Christian](https://github.com/Chryschii), [Jonas](https://github.com/jonas-g-laser), [Marcus](https://www.github.com/gugacs), [Eva](https://github.com/evaharing)
