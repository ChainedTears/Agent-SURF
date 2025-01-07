const randomUseragent = require("random-useragent");
const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);
const { OpenAI } = require("openai");
const fs = require("fs");
const applescript = require("applescript");

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1/", // http://localhost:1234/v1
  apiKey: "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", // lm-studio
});

const prompt = "Turn WiFi off and shutdown my computer";

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
  Your plans must be possible to achieve using either AppleScript or Playwright.
  Always use AppleScript to complete a task if possible.
  If instructions require you to generate text content, do not seperate the writing into multiple steps, do it in one.
  Remember to not provide content in the instructions you generate, just the instructions.
  Remember to not use context between steps - the step will be executed by different agents.
  
  Example:
  
  Prompt: Search for the song "Last Friday Night" on Spotify
  
  Response Format (It must ONLY be AppleScript or Playwright, not both):
  
  AppleScript,3,open spotify,input "Last Friday Night" into the search bar,press enter
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

async function runExecutionAgent(language, instruction, html) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
  Your task is to output a single Playwright function or AppleScript that executes only the assigned step from a provided list of steps.
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

  Output (AppleScript):

    tell application "Spotify"
      activate
    end tell
        `,
        },
        {
          role: "user",
          content: `Language: ${language}\nInstruction: ${instruction}\nHTML: ${html}\n Original Prompt: ${prompt} (For context only)`,
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

(async () => {
  try {
    const plans = await runPlanner();
    console.log("Generated Plan:", plans);

    const [language, count, ...steps] = plans.split(",");
    if (language === "AppleScript") {
      for (let i = 0; i < Number(count); i++) {
        const html = "Not existent, AppleScript only";
        const code = await runExecutionAgent(language, steps[i].trim(), html);
        const cleancode = code.replace(
          /```appleScript\s([\s\S]*?)\s*```/g,
          "$1"
        );
        console.log("\n ---------------------- \n" + "Step:", steps[i].trim());
        console.log(`Generated Code for Step ${i + 1}:\n`, cleancode);
        applescript.execString(cleancode, (err, rtn) => {
          if (err) {
            console.error(
              "AppleScript Error:",
              err + "\n ---------------------- \n"
            );
          } else {
            console.log(
              "AppleScript Result:",
              rtn + "\n ---------------------- \n"
            );
          }
        });
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
      }
    }
  } catch (error) {
    console.error("Error in Main Execution:", error);
  }
})();
