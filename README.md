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
npm install
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
    A[Start] --> B{OS Platform?};
    B -- darwin --> C[MacOS Execution];
    B -- win32 --> D[Windows Execution];
    C --> E[Run Planner];
    D --> E;
    E --> F{Language?};
    F -- AppleScript --> G[AppleScript Loop];
    F -- Playwright --> H[Playwright Loop (MacOS)];
    F -- Powershell --> I[Powershell Loop];
    F -- Playwright --> J[Playwright Loop (Windows)];
    G --> K[Run Execution Agent];
    H --> L[Run Execution Agent];
    I --> M[Run Execution Agent];
    J --> N[Run Execution Agent];
    K --> O[Execute AppleScript];
    L --> P[Execute Playwright (MacOS)];
    M --> Q[Execute Powershell];
    N --> R[Execute Playwright (Windows)];
    O --> S[Log Result/Error];
    P --> T[Log Result/Error];
    Q --> U[Log Result/Error];
    R --> V[Log Result/Error];
    S --> W{Loop End?};
    T --> X{Loop End?};
    U --> Y{Loop End?};
    V --> Z{Loop End?};
    W -- No --> G;
    X -- No --> H;
    Y -- No --> I;
    Z -- No --> J;
    W -- Yes --> AA[End];
    X -- Yes --> AA;
    Y -- Yes --> AA;
    Z -- Yes --> AA;

    subgraph " "
        direction LR
        K["runExecutionAgent(AppleScript, step, html)"]
        L["runExecutionAgent(Playwright, step, html)"]
        M["runExecutionAgent(Powershell, step, html)"]
        N["runExecutionAgent(Playwright, step, html)"]
    end
    
    subgraph " "
      direction LR
      O["applescript.execString(code)"]
      Q["exec('powershell...', code)"]
    end

    subgraph "Playwright Setup"
        H["Initialize Playwright (MacOS)"]
        J["Initialize Playwright (Windows)"]
        P["eval(code)"]
        R["eval(code)"]
    end


    E["runPlanner()"]
```

* * *

## 🚀 Support the Project 💖

If you find Agent SURF useful, give this repo a ⭐ and share it with others who might benefit!

*Built with ❤️ by Arthur Jiang and Nam Le. Happy automating!*
