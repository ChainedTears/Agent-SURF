const stealth = require("puppeteer-extra-plugin-stealth")();
const randomUseragent = require("random-useragent");
const { chromium } = require("playwright-extra");
const { exec } = require("child_process");
const { OpenAI } = require("openai");
const fs = require("fs");
const os = require("os");
chromium.use(stealth);
let promptlanguage;
let applescript;
let example;

const prompt =
  "Shutdown my computer";

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1/", // http://localhost:1234/v1
  apiKey: "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", // lm-studio
});

if (os.platform() === "darwin") {
  example = `
  \`\`\`applescript
  tell application "Spotify"
      activate
    end tell
  \`\`\`
  `;
  applescript = require("applescript");
  promptlanguage = "AppleScript";
} else if (os.platform() === "win32") {
  example = `
  $spotifyPath = "$env:LOCALAPPDATA\Microsoft\WindowsApps\Spotify.exe"
if (Test-Path $spotifyPath) {
    Start-Process -FilePath $spotifyPath
} else {
    Write-Output "Spotify is not installed or the executable path is incorrect."
}
  `;
  promptlanguage = "Powershell";
}

async function runPlanner() {
  const userPrompt = `User Prompt: ${prompt}`;
  console.log("Generating Plan...");

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
  You are an AI assistant for planning automated tasks. 
  Your goal is to generate a minimal, efficient set of steps to complete a task based on the user’s prompt.
  Your plans must be possible to achieve using either ${promptlanguage} or Playwright.
  Always use ${promptlanguage} to complete a task if possible.
  If instructions require you to generate text content, do not seperate the writing into multiple steps, do it in one.
  Remember to not provide content in the instructions you generate, just the instructions.
  Remember to not use context between steps - the step will be executed by different agents.
  If you are using Playwright, assume the browser is already open in the environment the task will be executed in.
  Never predetermine the button to click. For example, instead of saying "click on the "name" button", say "click on the button that does this"
  
  Example:
  
  Prompt: Search for the song "Last Friday Night" on Spotify
  
  Response Format (It must ONLY be ${promptlanguage} or Playwright, not both):
  
  ${promptlanguage},3,open spotify,input "Last Friday Night" into the search bar,press enter
        `,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error in Planner:", error);
    throw error;
  }
}

async function runExecutionAgent(language, instruction, html, screencontent) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
  Your task is to output a single Playwright function or ${promptlanguage} that executes only the assigned step from a provided list of steps.
  Strictly follow the instructions, focusing only on the specific step. Output the code only without comments or explanations.
  You must only complete the instruction given to you without completing the entire task.
  Assume the browser is already open in the environment your code will run in.
  
  EXAMPLES:
  
  Instruction: Press enter

  output (JavaScript):
  
  (async () => {
    await page.keyboard.press('Enter');
  })();
  
  Instruction: Open the Spotify app

  Output (${promptlanguage}):

    ${example}
        `,
        },
        {
          role: "user",
          content: `Language: ${language}\nInstruction: ${instruction}\nHTML: ${html}\n Original Prompt: ${prompt} (For context only)\n`,
        },
      ],
      temperature: 0.5,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error in Execution Agent:", error);
    throw error;
  }
}

if (os.platform() === "darwin") {
  (async () => {
    try {
      const plans = await runPlanner();
      console.log("Generated Plan:", plans);

      const [language, count, ...steps] = plans.split(",");
      if (language === "AppleScript") {
        for (let i = 0; i < Number(count); i++) {
          const html = "Playwright only";
          const code = await runExecutionAgent(language, steps[i].trim(), html);
          const cleancode = code.replace(
            /```applescript\s([\s\S]*?)\s*```/g,
            "$1"
          );
          console.log(
            "\n ---------------------- \n" + "Step:",
            steps[i].trim()
          );
          console.log(`Generated Code for Step ${i + 1}:\n`, cleancode);
          applescript.execString(cleancode);
        }
      } else if (language === "Playwright") {
        const userAgent = randomUseragent.getRandom();
        const storage = fs.readFileSync("session.json", "utf-8");
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({
          userAgent: userAgent,
          viewport: {
            width: Math.floor(Math.random() * (1920 - 800 + 1)) + 800,
            height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,
          },
          locale: "en-US",
          timezoneId: "America/Los_Angeles",
          storageState: JSON.parse(storage),
        });
        const page = await context.newPage();
        for (let i = 0; i < Number(count); i++) {
          await page.waitForLoadState("load");
          const html = await page.evaluate(() => {
            const elements = Array.from(document.body.querySelectorAll("*"));

            elements.forEach((i) => {
              const style = window.getComputedStyle(i);
              if (
                (style.display === "none" ||
                  style.visibility === "hidden" ||
                  style.opacity === "0") &&
                i.tagName.toLowerCase() !== "input"
              ) {
                i.remove();
              }
            });

            return document.body.innerHTML
              .replace(/\n\s*/g, "")
              .replace(/>\s+</g, "><")
              .trim();
          });
          const code = await runExecutionAgent(language, steps[i].trim(), html);
          const cleancode = code.replace(
            /```javascript\s([\s\S]*?)\s*```/g,
            "$1"
          );
          console.log(`Generated Code for Step ${i + 1}:\n`, cleancode);
          await eval(cleancode);
          const newStorage = await context.storageState();
          fs.writeFileSync("session.json", JSON.stringify(newStorage));
        }
      }
    } catch (error) {
      console.error("Error in Main Execution:", error);
    }
  })();
} else if (os.platform() === "win32") {
  (async () => {
    try {
      const plans = await runPlanner();
      console.log("Generated Plan:", plans);

      const [language, count, ...steps] = plans.split(",");
      if (language === "Powershell") {
        for (let i = 0; i < Number(count); i++) {
          const html = "Not existent, PlayWright only";
          const code = await runExecutionAgent(language, steps[i].trim(), html);
          const cleancode = code.replace(
            /```powershell\s([\s\S]*?)\s*```/g,
            "$1"
          );
          console.log(
            "\n ---------------------- \n" + "Step:",
            steps[i].trim()
          );
          console.log(`Generated Code for Step ${i + 1}:\n`, cleancode);
          exec(
            `powershell -ExecutionPolicy Bypass -Command "${cleancode}"`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Error: ${error.message}`);
                return;
              }
              if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
              }
              console.log(`Output: ${stdout}`);
            }
          );
        }
      } else if (language === "Playwright") {
        const userAgent = randomUseragent.getRandom();
        const storage = fs.readFileSync("session.json", "utf-8");
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({
          userAgent: userAgent,
          viewport: {
            width: Math.floor(Math.random() * (1920 - 800 + 1)) + 800,
            height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,
          },
          locale: "en-US",
          timezoneId: "America/Los_Angeles",
          storageState: JSON.parse(storage),
        });
        const page = await context.newPage();
        for (let i = 0; i < Number(count); i++) {
          await page.waitForLoadState("load");
          const html = await page.evaluate(() => {
            const elements = Array.from(document.body.querySelectorAll("*"));

            elements.forEach((i) => {
              const style = window.getComputedStyle(i);
              if (
                (style.display === "none" ||
                  style.visibility === "hidden" ||
                  style.opacity === "0") &&
                i.tagName.toLowerCase() !== "input"
              ) {
                i.remove();
              }
            });

            return document.body.innerHTML
              .replace(/\n\s*/g, "")
              .replace(/>\s+</g, "><")
              .trim();
          });
          const code = await runExecutionAgent(language, steps[i].trim(), html);
          const cleancode = code.replace(
            /```javascript\s([\s\S]*?)\s*```/g,
            "$1"
          );
          console.log(`Generated Code for Step ${i + 1}:\n`, cleancode);
          await eval(cleancode);
          const newStorage = await context.storageState();
          fs.writeFileSync("session.json", JSON.stringify(newStorage));
        }
      }
    } catch (error) {
      console.error("Error in Main Execution:", error);
    }
  })();
}
