<img width="200" src="logo.png">

# 🏄 Agent SURF 🌐

**Agent SURF** is an advanced automation tool designed to complete tasks, scrape data, and more on your computer using AI. Using powerful technologies like **Playwright, AppleScript, Powershell**, it takes user prompts (tasks) and breaks them down into actionable steps. The execution agents then follow these steps to efficiently complete the desired actions. Say goodbye to repetitive tasks—Agent SURF does it all for you!  
[ << Demo Video >>](https://www.youtube.com/watch?v=dx3_Sfv_DnY)

* * *

## 🛠️ Installation Guide 📖

### 📦 Prerequisites:

- [Node.js](https://nodejs.org/en) (Required for running the script)
- [npm](https://www.npmjs.com/) (Used to manage project dependencies)
- A Chat Completion API provider that supports OpenAI. **[Groq](https://console.groq.com/keys) is recommended.**
- Enabling Accessibility Permissions for the app you are executing this script in (Terminal, VSCode, Etc) **Settings -&gt; Privacy and Security -&gt; Accessibility -&gt; \[App Name] -&gt; On**
- **OR**
- Terminal/Command Prompt launched with Administrator Access

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

*Rememeber to customize the prompt inside index.js and set your own API key before starting the script!*

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
    H --> I[Check Language - AppleScript]
    I --> J[Execute AppleScript Step]
    H --> K[Check Language - Playwright]
    K --> L[Execute Playwright Step]
    H --> M[Check Language - Powershell]
    M --> N[Execute Powershell Step]
    J --> O[End]
    L --> O
    N --> O
    O --> P[Store New Session State]
    P --> Q[End]

    subgraph MacOS Steps
        C --> E
        E --> G
        G --> H
        H --> I
        I --> J
        J --> O
    end

    subgraph Windows Steps
        D --> F
        F --> G
        G --> H
        H --> M
        M --> N
        N --> O
    end
```

* * *

## 🚀 Support the Project 💖

If you find Agent SURF useful, give this repo a ⭐ and share it with others who might benefit!

*Built with ❤️ by Arthur Jiang and Nam Le. Happy automating!*
