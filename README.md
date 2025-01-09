<img width="200" src="logo.png">

# 🏄 Agent SURF 🌐

**Agent SURF** is an advanced automation tool designed to complete tasks, scrape data, and more on your computer using AI. Using powerful technologies like **Playwright, AppleScript, Powershell**, it takes user prompts (tasks) and breaks them down into actionable steps. The execution agents then follow these steps to efficiently complete the desired actions. Let Agent SURF do the heavy lifting for you.
[ << Demo Video >>](https://www.youtube.com/watch?v=dx3_Sfv_DnY)

* * *

## 🛠️ Installation Guide 📖

### 📦 Prerequisites:

- [Node.js](https://nodejs.org/en) (Required for running the script)
- [npm](https://www.npmjs.com/) (Used to manage project dependencies)
- A Chat Completion API provider that supports OpenAI. **[Groq](https://console.groq.com/keys) is recommended.**
- Enabling Accessibility Permissions for the app you are executing this script in (Terminal, VSCode, Etc):
- - **Settings -&gt; Privacy and Security -&gt; Accessibility -&gt; \[App Name] -&gt; On**
- **OR** launch your terminal with Administrator Access

### 🔧 Installation Steps:

```
git clone https://github.com/ChainedTears/Agent-SURF
cd Agent-SURF
npm init -y
npm install puppeteer-extra playwright-extra random-useragent applescript openai fs
```

### 🏁 Usage:

```
node script.js
```

*Customize the prompt in index.js and set your API key before running the script.*

* * *

## 🏗️ Architecture Overview 🧱

```mermaid
graph TD
    A[Start] --> B[Check OS Platform]
    B -->|macOS| C[Set AppleScript Example]
    B -->|Windows| D[Set Powershell Example]
    C --> E[Run Planner for macOS]
    D --> F[Run Planner for Windows]
    E --> G[Generate Plan]
    F --> G
    G --> H[Parse Plan into Steps]
    H --> I[Loop for Number of Steps]
    I --> J[Check Language - AppleScript]
    J --> K[Execute AppleScript Step]
    I --> L[Check Language - Playwright]
    L --> M[Execute Playwright Step]
    I --> N[Check Language - Powershell]
    N --> O[Execute Powershell Step]
    K --> P[End]
    M --> P
    O --> P
    P --> Q[Store New Session State]
    Q --> R[End]

    subgraph MacOS Steps
        C --> E
        E --> G
        G --> H
        H --> I
        I --> J
        J --> K
        K --> P
    end

    subgraph Windows Steps
        D --> F
        F --> G
        G --> H
        H --> I
        I --> N
        N --> O
        O --> P
    end

```

* * *

## 🚀 Support the Project 💖

If you find Agent SURF helpful, give this repo a ⭐ and share it with others who may benefit!

Built with ❤️ by Arthur Jiang and Nam Le. Happy automating!

